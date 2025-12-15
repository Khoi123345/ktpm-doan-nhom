import axios from "axios";
import crypto from "crypto";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import Cart from "../models/Cart.js";

class PaymentController {
    // Config MoMo
    getMomoConfig() {
        return {
            partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
            accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
            secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
            endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
            redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/status",
            ipnUrl: process.env.MOMO_IPN_URL || "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b" // Fallback for testing
        };
    }

    create = async (req, res) => {
        try {
            const { orderId } = req.body;

            // 1. Tìm đơn hàng
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // 2. Lấy config
            const config = this.getMomoConfig();
            const { partnerCode, accessKey, secretKey, endpoint, redirectUrl, ipnUrl } = config;

            // 3. Chuẩn bị dữ liệu cho MoMo
            // requestId và orderId của MoMo phải là duy nhất. 
            // Ta dùng order._id + timestamp để đảm bảo duy nhất mỗi lần thử thanh toán lại.
            const requestId = order._id.toString() + "_" + new Date().getTime();
            const momoOrderId = requestId;
            const amount = order.totalPrice.toString();
            const orderInfo = `Thanh toán đơn hàng ${order._id}`;
            const requestType = "payWithMethod";
            const extraData = JSON.stringify({ dbOrderId: order._id.toString() }); // Lưu ID đơn hàng gốc vào extraData

            // 4. Tạo chữ ký (Signature)
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

            const signature = crypto
                .createHmac("sha256", secretKey)
                .update(rawSignature)
                .digest("hex");

            // 5. Tạo request body
            const requestBody = {
                partnerCode,
                partnerName: "BookStore",
                storeId: "BookStore",
                requestId,
                amount,
                orderId: momoOrderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang: "vi",
                requestType,
                autoCapture: true,
                extraData,
                signature,
            };

            // 6. Gọi API MoMo
            console.log("Sending request to MoMo:", requestBody);
            const response = await axios.post(endpoint, requestBody, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("MoMo Response:", response.data);

            if (response.data.resultCode !== 0) {
                throw new Error(response.data.message || "Tạo thanh toán MoMo thất bại");
            }

            // 7. Trả về kết quả cho Frontend
            // Frontend sẽ redirect user đến response.data.payUrl
            res.status(201).json({
                success: true,
                data: {
                    paymentUrl: response.data.payUrl,
                    requestId: response.data.requestId,
                    orderId: response.data.orderId
                }
            });

        } catch (error) {
            console.error("Create Payment Error:", error.message);
            console.error("Error Details:", error.response?.data);
            res.status(400).json({ message: error.message });
        }
    }

    // Helper function to update order status and stock
    async _confirmOrderPayment(order, paymentResult) {
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentMethod = "MoMo";
            order.paymentResult = paymentResult;

            // Cập nhật trạng thái đơn hàng sang 'confirmed'
            if (order.status === 'pending') {
                order.status = 'confirmed';

                // Trừ tồn kho
                for (const item of order.orderItems) {
                    const book = await Book.findById(item.book);
                    if (book) {
                        book.stock = Math.max(0, book.stock - item.quantity);
                        await book.save();
                    }
                }
            }

            await order.save();
            console.log(`Order ${order._id} updated to PAID and CONFIRMED`);

            // Remove items from user's cart
            try {
                const cart = await Cart.findOne({ user: order.user });
                if (cart) {
                    const orderBookIds = order.orderItems.map(item => item.book.toString());
                    cart.items = cart.items.filter(item => !orderBookIds.includes(item.book.toString()));
                    await cart.save();
                    console.log(`Removed purchased items from cart for user ${order.user}`);
                }
            } catch (error) {
                console.error("Error removing items from cart:", error);
            }
        }
    }

    // Hàm xử lý IPN (thông báo ngầm) từ MoMo
    handleMomoIPN = async (req, res) => {
        console.log("--- MoMo IPN Received ---");
        console.log(req.body);

        try {
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
                signature
            } = req.body;

            // TODO: Xác thực chữ ký (Signature) để bảo mật
            // const config = this.getMomoConfig();
            // ... logic verify signature ...

            // Lấy dbOrderId từ extraData
            let dbOrderId;
            try {
                const extraDataParsed = JSON.parse(extraData);
                dbOrderId = extraDataParsed.dbOrderId;
            } catch (e) {
                console.log("Fallback: Extracting orderId from MoMo orderId string");
                // Nếu không parse được, thử lấy từ orderId (format: id_timestamp)
                dbOrderId = orderId ? orderId.split("_")[0] : null;
            }

            if (!dbOrderId) {
                return res.status(400).json({ message: "Cannot determine Order ID" });
            }

            const order = await Order.findById(dbOrderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            if (resultCode === 0) {
                // Thanh toán thành công
                const paymentResult = {
                    id: transId ? transId.toString() : requestId,
                    status: "completed",
                    update_time: new Date().toISOString(),
                };
                await this._confirmOrderPayment(order, paymentResult);
            } else {
                // Thanh toán thất bại
                console.log(`Payment failed for order ${dbOrderId}: ${message}`);
            }

            // Phản hồi cho MoMo
            res.status(204).send();

        } catch (error) {
            console.error("IPN Handling Error:", error.message);
            res.status(500).json({ message: error.message });
        }
    }

    // Hàm kiểm tra trạng thái thanh toán từ Frontend (sau khi redirect)
    checkStatus = async (req, res) => {
        try {
            const { orderId, requestId, resultCode } = req.body;

            // Tìm đơn hàng dựa trên orderId (hoặc requestId nếu lưu)
            // Lưu ý: orderId từ MoMo trả về là format "id_timestamp"
            let dbOrderId = orderId;
            if (orderId && orderId.includes("_")) {
                dbOrderId = orderId.split("_")[0];
            }

            const order = await Order.findById(dbOrderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            if (parseInt(resultCode) === 0) {
                const paymentResult = {
                    id: requestId,
                    status: "completed",
                    update_time: new Date().toISOString(),
                };
                await this._confirmOrderPayment(order, paymentResult);

                return res.status(200).json({ message: "Payment successful", orderId: dbOrderId });
            } else {
                // Payment failed, delete the pending order
                await Order.findByIdAndDelete(dbOrderId);
                return res.status(400).json({ message: "Payment failed. Order has been cancelled." });
            }
        } catch (error) {
            console.error("Check Status Error:", error.message);
            res.status(500).json({ message: error.message });
        }
    }

    // Các hàm cũ (giữ lại hoặc stub để tránh lỗi nếu có route gọi tới)
    getById = async (req, res) => {
        res.status(501).json({ message: "Not implemented (No Payment model)" });
    }

    getByOrder = async (req, res) => {
        try {
            const order = await Order.findById(req.params.orderId);
            if (!order) return res.status(404).json({ message: "Order not found" });

            res.status(200).json({
                isPaid: order.isPaid,
                paidAt: order.paidAt,
                paymentResult: order.paymentResult,
                paymentMethod: order.paymentMethod
            });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    getByStatus = async (req, res) => {
        res.status(501).json({ message: "Not implemented" });
    }

    update = async (req, res) => {
        res.status(501).json({ message: "Not implemented" });
    }

    delete = async (req, res) => {
        res.status(501).json({ message: "Not implemented" });
    }
}

const paymentController = new PaymentController();

// Export individual methods for testing (bound to instance)
export const createMoMoPaymentUrl = paymentController.create.bind(paymentController);
export const momoIPN = paymentController.handleMomoIPN.bind(paymentController);
export const checkPaymentStatus = paymentController.checkStatus.bind(paymentController);
export const getPaymentById = paymentController.getById.bind(paymentController);
export const getPaymentByOrder = paymentController.getByOrder.bind(paymentController);
export const getPaymentByStatus = paymentController.getByStatus.bind(paymentController);
export const updatePayment = paymentController.update.bind(paymentController);
export const deletePayment = paymentController.delete.bind(paymentController);

export default paymentController;
