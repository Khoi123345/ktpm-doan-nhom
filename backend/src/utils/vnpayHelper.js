import crypto from 'crypto';
import querystring from 'querystring';
import moment from 'moment';
import config from '../config/env.js';

/**
 * Sort object by key
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}

/**
 * Create VNPay payment URL
 * @param {Object} orderInfo - Order information
 * @returns {String} - VNPay payment URL
 */
export const createVNPayUrl = (orderInfo) => {
    const { orderId, amount, orderDescription, ipAddr } = orderInfo;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

    const tmnCode = config.vnpay.tmnCode;
    const secretKey = config.vnpay.hashSecret;
    const vnpUrl = config.vnpay.url;
    const returnUrl = config.vnpay.returnUrl;

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderDescription,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100, // VNPay requires amount in smallest unit
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
};

/**
 * Verify VNPay return signature
 * @param {Object} vnpParams - VNPay return parameters
 * @returns {Boolean} - Verification result
 */
export const verifyVNPaySignature = (vnpParams) => {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const secretKey = config.vnpay.hashSecret;
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
};

/**
 * Parse VNPay return data
 * @param {Object} vnpParams - VNPay return parameters
 * @returns {Object} - Parsed payment result
 */
export const parseVNPayReturn = (vnpParams) => {
    return {
        orderId: vnpParams.vnp_TxnRef,
        amount: vnpParams.vnp_Amount / 100,
        orderInfo: vnpParams.vnp_OrderInfo,
        responseCode: vnpParams.vnp_ResponseCode,
        transactionNo: vnpParams.vnp_TransactionNo,
        bankCode: vnpParams.vnp_BankCode,
        payDate: vnpParams.vnp_PayDate,
        isSuccess: vnpParams.vnp_ResponseCode === '00',
    };
};

export default {
    createVNPayUrl,
    verifyVNPaySignature,
    parseVNPayReturn,
};
