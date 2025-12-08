import crypto from 'crypto';
import axios from 'axios';
import config from '../config/env.js';

/**
 * Create MoMo payment request
 * @param {Object} orderInfo - Order information
 * @returns {Promise<Object>} - MoMo payment response
 */
export const createMoMoPayment = async (orderInfo) => {
    const { orderId, amount, orderDescription } = orderInfo;

    const partnerCode = config.momo.partnerCode;
    const accessKey = config.momo.accessKey;
    const secretKey = config.momo.secretKey;
    const endpoint = config.momo.endpoint;
    const returnUrl = config.momo.redirectUrl;
    const ipnUrl = config.momo.ipnUrl;

    const requestId = orderId;
    const requestType = 'captureWallet';
    const extraData = '';

    // Create signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderDescription}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo: orderDescription,
        redirectUrl: returnUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'vi',
    };

    try {
        const response = await axios.post(endpoint, requestBody);
        return response.data;
    } catch (error) {
        console.error('MoMo payment error:', error);
        throw error;
    }
};

/**
 * Verify MoMo signature
 * @param {Object} momoParams - MoMo return/IPN parameters
 * @returns {Boolean} - Verification result
 */
export const verifyMoMoSignature = (momoParams) => {
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
    } = momoParams;

    const secretKey = config.momo.secretKey;

    const rawSignature = `accessKey=${config.momo.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    return signature === expectedSignature;
};

/**
 * Parse MoMo return data
 * @param {Object} momoParams - MoMo return parameters
 * @returns {Object} - Parsed payment result
 */
export const parseMoMoReturn = (momoParams) => {
    return {
        orderId: momoParams.orderId,
        amount: momoParams.amount,
        orderInfo: momoParams.orderInfo,
        resultCode: momoParams.resultCode,
        transId: momoParams.transId,
        message: momoParams.message,
        payType: momoParams.payType,
        responseTime: momoParams.responseTime,
        isSuccess: momoParams.resultCode === 0,
    };
};

export default {
    createMoMoPayment,
    verifyMoMoSignature,
    parseMoMoReturn,
};
