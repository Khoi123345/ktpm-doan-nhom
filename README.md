# 📚 Online Bookstore - Hệ thống Nhà Sách Online

Dự án website thương mại điện tử cho nhà sách online được xây dựng với MERN Stack (MongoDB, Express, React, Node.js).

## 🎯 Tổng quan dự án

### Công nghệ sử dụng

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (Image Upload)
- VNPay & MoMo Payment Gateway
- Bcrypt (Password Hashing)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router v6
- Axios
- React Hook Form
- React Icons
- React Toastify

## ✅ Tính năng đã hoàn thành

### Backend (33 files)

#### Core Features
- ✅ Authentication & Authorization (JWT + Role-based)
- ✅ User Management (CRUD)
- ✅ Book Management (CRUD + Image Upload)
- ✅ Category Management (CRUD)
- ✅ Order Management
- ✅ Review & Rating System
- ✅ Coupon/Discount System
- ✅ Payment Integration (VNPay + MoMo + COD)

#### Models (6 files)
- ✅ User Model (với password hashing)
- ✅ Book Model (với text search index)
- ✅ Category Model
- ✅ Order Model (với payment tracking)
- ✅ Review Model
- ✅ Coupon Model (percentage & fixed discount)

#### Controllers (8 files)
- ✅ Auth Controller (register, login, profile)
- ✅ Book Controller (CRUD, search, filter, pagination)
- ✅ Category Controller (CRUD)
- ✅ Order Controller (create, track, update status)
- ✅ Review Controller (create, get, delete)
- ✅ Coupon Controller (validate, CRUD)
- ✅ Payment Controller (VNPay & MoMo integration)
- ✅ User Controller (admin user management)

#### Routes (8 files)
- ✅ Auth Routes
- ✅ Book Routes
- ✅ Category Routes
- ✅ Order Routes
- ✅ Review Routes
- ✅ Coupon Routes
- ✅ Payment Routes
- ✅ User Routes

#### Middlewares (4 files)
- ✅ Auth Middleware (JWT verification)
- ✅ Admin Middleware (role check)
- ✅ Upload Middleware (Multer)
- ✅ Error Middleware

#### Utils (4 files)
- ✅ JWT Token Generator
- ✅ Cloudinary Upload/Delete
- ✅ VNPay Helper
- ✅ MoMo Helper

### Frontend (29 files)

#### Configuration (8 files)
- ✅ package.json
- ✅ vite.config.js
- ✅ tailwind.config.js
- ✅ postcss.config.js
- ✅ index.html
- ✅ src/index.css
- ✅ src/main.jsx
- ✅ src/App.jsx

#### Redux Store (7 files)
- ✅ Redux Store Setup
- ✅ Auth Slice (login, register, profile)
- ✅ Books Slice (get books, get book details)
- ✅ Cart Slice (add, remove, update, coupon)
- ✅ Orders Slice (create, get orders)
- ✅ Categories Slice
- ✅ Coupons Slice (validate)

#### Components (4 files)
- ✅ Header (với cart count, user menu)
- ✅ Footer
- ✅ PrivateRoute
- ✅ AdminRoute

#### Pages (11 files)
- ✅ HomePage (hero + featured books)
- ✅ LoginPage
- ✅ RegisterPage
- ✅ CartPage (với quantity controls)
- ✅ BookListPage (placeholder)
- ✅ BookDetailPage (placeholder)
- ✅ CheckoutPage (placeholder)
- ✅ ProfilePage (placeholder)
- ✅ OrderHistoryPage (placeholder)
- ✅ PaymentSuccessPage
- ✅ PaymentFailPage

#### Admin Pages (5 files)
- ✅ AdminDashboard (placeholder)
- ✅ AdminBooks (placeholder)
- ✅ AdminOrders (placeholder)
- ✅ AdminCoupons (placeholder)
- ✅ AdminUsers (placeholder)

#### Services
- ✅ Axios API instance (với interceptors)

## 📁 Cấu trúc thư mục

```
ktpm/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database, Cloudinary config
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Route controllers
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Custom middlewares
│   │   ├── utils/             # Utility functions
│   │   └── server.js          # Entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
└── frontend/                   # Frontend React App
    ├── src/
    │   ├── app/               # Redux store
    │   ├── features/          # Redux slices
    │   ├── components/        # React components
    │   ├── pages/             # Page components
    │   ├── services/          # API services
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

## 🚀 Hướng dẫn cài đặt

### 1. Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env` (copy từ `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_HASH_SECRET=your_vnpay_secret
MOMO_PARTNER_CODE=your_momo_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
FRONTEND_URL=http://localhost:3000
```

Chạy backend:
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy profile (Protected)
- `PUT /api/auth/profile` - Cập nhật profile (Protected)

### Books
- `GET /api/books` - Danh sách sách (filter, search, pagination)
- `GET /api/books/:id` - Chi tiết sách
- `POST /api/books` - Tạo sách (Admin)
- `PUT /api/books/:id` - Cập nhật sách (Admin)
- `DELETE /api/books/:id` - Xóa sách (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng (Protected)
- `GET /api/orders/myorders` - Đơn hàng của user (Protected)
- `GET /api/orders/:id` - Chi tiết đơn hàng (Protected)
- `GET /api/orders` - Tất cả đơn hàng (Admin)

### Coupons
- `POST /api/coupons/validate` - Validate coupon
- `GET /api/coupons` - Danh sách coupon active
- `POST /api/coupons` - Tạo coupon (Admin)

### Payment
- `POST /api/payment/vnpay/create` - Tạo VNPay payment URL
- `POST /api/payment/momo/create` - Tạo MoMo payment

## 🎨 Features Highlights

### Customer Features
- 🔍 Tìm kiếm & lọc sách
- 📖 Xem chi tiết sách & đánh giá
- 🛒 Quản lý giỏ hàng
- 🎫 Áp dụng mã giảm giá
- 💳 Thanh toán (COD, VNPay, MoMo)
- 📦 Theo dõi đơn hàng
- 👤 Quản lý tài khoản

### Admin Features
- 📊 Dashboard thống kê
- 📚 Quản lý sách (CRUD)
- 📦 Quản lý đơn hàng
- 🎫 Quản lý mã giảm giá
- 👥 Quản lý người dùng

## 📝 Tính năng có thể mở rộng

- [ ] Email notifications
- [ ] Forgot password
- [ ] Wishlist
- [ ] Product reviews with images
- [ ] Advanced search filters
- [ ] Sales reports & analytics
- [ ] Shipping tracking
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Input validation
- ✅ CORS configuration
- ✅ Payment signature verification

## 📌 Notes

- Backend phải chạy trước ở port 5000
- Frontend sẽ proxy API requests tới backend
- Cart state được lưu trong localStorage
- JWT token được lưu trong localStorage
- Một số pages frontend vẫn là placeholder, cần phát triển thêm

## 👨‍💻 Development Status

**Backend:** ✅ Hoàn thành 100% (33/33 files)
**Frontend:** ⚠️ Hoàn thành 60% (29/~50 files)

Frontend cần phát triển thêm:
- BookListPage với filter & pagination
- BookDetailPage với reviews
- CheckoutPage với shipping form
- ProfilePage với order history
- Admin pages với full CRUD operations
- Các components bổ sung (Loader, Pagination, Rating, etc.)

## 📄 License

ISC

---

**Developed with ❤️ for Online Bookstore Project**
