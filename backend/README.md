# Bookstore Backend API

Backend API cho hệ thống nhà sách online được xây dựng với Node.js, Express và MongoDB.

## Tính năng

- ✅ Xác thực người dùng với JWT
- ✅ Quản lý sách (CRUD)
- ✅ Quản lý thể loại
- ✅ Giỏ hàng (Cart)
- ✅ Quản lý đơn hàng
- ✅ Đánh giá & bình luận sách
- ✅ Hệ thống mã giảm giá/coupon

- ✅ Tích hợp thanh toán MoMo
- ✅ Upload ảnh lên Cloudinary
- ✅ Phân quyền Admin/User

## Công nghệ sử dụng

- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (Image Upload)

- MoMo Payment Gateway
- Bcrypt (Password Hashing)

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_atlas_uri

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret



# MoMo
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:3000/payment/momo/return
MOMO_IPN_URL=http://localhost:5000/api/payment/momo/ipn

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Chạy server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (Protected)
- `PUT /api/auth/profile` - Cập nhật profile (Protected)

### Books
- `GET /api/books` - Lấy danh sách sách (có filter, search, pagination)
- `GET /api/books/top` - Lấy sách đánh giá cao nhất
- `GET /api/books/new` - Lấy sách mới nhất
- `GET /api/books/:id` - Lấy chi tiết sách
- `POST /api/books` - Tạo sách mới (Admin)
- `PUT /api/books/:id` - Cập nhật sách (Admin)
- `DELETE /api/books/:id` - Xóa sách (Admin)
- `POST /api/books/upload` - Upload ảnh sách (Admin)

### Categories
- `GET /api/categories` - Lấy danh sách thể loại
- `GET /api/categories/:id` - Lấy chi tiết thể loại
- `POST /api/categories` - Tạo thể loại (Admin)
- `PUT /api/categories/:id` - Cập nhật thể loại (Admin)
- `DELETE /api/categories/:id` - Xóa thể loại (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng (Protected)
- `GET /api/orders/myorders` - Lấy đơn hàng của user (Protected)
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng (Protected)
- `PUT /api/orders/:id/pay` - Cập nhật trạng thái thanh toán (Protected)
- `GET /api/orders` - Lấy tất cả đơn hàng (Admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin)

### Reviews
- `POST /api/reviews/books/:id/reviews` - Tạo đánh giá (Protected)
- `GET /api/reviews/books/:id/reviews` - Lấy đánh giá của sách
- `DELETE /api/reviews/:id` - Xóa đánh giá (Admin)

### Coupons
- `GET /api/coupons` - Lấy danh sách coupon active
- `GET /api/coupons/:code` - Lấy coupon theo code
- `POST /api/coupons/validate` - Validate coupon
- `POST /api/coupons` - Tạo coupon (Admin)
- `PUT /api/coupons/:id` - Cập nhật coupon (Admin)
- `DELETE /api/coupons/:id` - Xóa coupon (Admin)
- `GET /api/coupons/admin/all` - Lấy tất cả coupon (Admin)

### Payment

- `POST /api/payment/momo/create` - Tạo payment MoMo (Protected)
- `POST /api/payment/momo/return` - MoMo return handler
- `POST /api/payment/momo/ipn` - MoMo IPN handler

### Cart
- `GET /api/cart` - Lấy giỏ hàng của user (Protected)
- `POST /api/cart` - Thêm sản phẩm vào giỏ hàng (Protected)
- `PUT /api/cart/:itemId` - Cập nhật số lượng sản phẩm (Protected)
- `DELETE /api/cart/:itemId` - Xóa sản phẩm khỏi giỏ hàng (Protected)
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng (Protected)

### Users (Admin)
- `GET /api/users` - Lấy danh sách users (Admin)
- `GET /api/users/:id` - Lấy chi tiết user (Admin)
- `PUT /api/users/:id` - Cập nhật user (Admin)
- `DELETE /api/users/:id` - Xóa user (Admin)

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Database, Cloudinary config
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Hướng dẫn test

### Automated Tests (Jest + Supertest)

Chạy tất cả tests:
```bash
npm test
```

Chạy tests với watch mode:
```bash
npm run test:watch
```

Test coverage bao gồm:
- Authentication endpoints (register, login, profile)
- Cart endpoints (add, update, remove, clear)
- Book endpoints (CRUD, filters, pagination)
- Order endpoints (create, get, update status)

### Manual Testing (Postman/Thunder Client)

1. Sử dụng Postman hoặc Thunder Client
2. Import collection từ file `postman_collection.json` (nếu có)
3. Test các endpoints theo thứ tự:
   - Register/Login để lấy token
   - Thêm token vào Authorization header
   - Test các endpoints khác

## Lưu ý

- Cần tạo tài khoản MongoDB Atlas (miễn phí)
- Cần tạo tài khoản Cloudinary (miễn phí)

- Cần lấy MoMo test credentials để test thanh toán
- Đảm bảo tất cả environment variables được cấu hình đúng

## License

ISC
