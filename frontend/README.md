# Bookstore Frontend

Frontend cho hệ thống nhà sách online được xây dựng với React, Tailwind CSS, và Redux Toolkit.

## ✅ Đã hoàn thành

### Configuration (8 files)
- ✅ package.json - Dependencies
- ✅ vite.config.js - Vite configuration
- ✅ tailwind.config.js - Tailwind CSS
- ✅ postcss.config.js - PostCSS
- ✅ index.html - HTML entry
- ✅ src/index.css - Global styles
- ✅ src/main.jsx - React entry point
- ✅ src/App.jsx - Main app with routing

### Redux Store (7 files)
- ✅ src/app/store.js - Redux store
- ✅ src/features/auth/authSlice.js - Authentication
- ✅ src/features/books/bookSlice.js - Books management
- ✅ src/features/cart/cartSlice.js - Shopping cart
- ✅ src/features/orders/orderSlice.js - Orders
- ✅ src/features/categories/categorySlice.js - Categories
- ✅ src/features/coupons/couponSlice.js - Coupons

### Services
- ✅ src/services/api.js - Axios instance with interceptors

## 📝 Cần tạo thêm

### Components cần tạo:

#### 1. Layout Components (3 files)
```jsx
// src/components/layout/Header.jsx
- Navigation bar
- Logo, search, cart icon, user menu
- Responsive mobile menu

// src/components/layout/Footer.jsx
- Footer with links, contact info

// src/components/layout/Navbar.jsx
- Category navigation
```

#### 2. Route Protection (2 files)
```jsx
// src/components/PrivateRoute.jsx
- Protect routes requiring authentication

// src/components/AdminRoute.jsx
- Protect admin-only routes
```

#### 3. Common Components (5 files)
```jsx
// src/components/common/Loader.jsx
// src/components/common/Message.jsx
// src/components/common/Pagination.jsx
// src/components/common/Rating.jsx
// src/components/common/Modal.jsx
```

#### 4. Book Components (4 files)
```jsx
// src/components/books/BookCard.jsx
// src/components/books/BookList.jsx
// src/components/books/BookFilter.jsx
// src/components/books/BookSearch.jsx
```

#### 5. Cart Components (2 files)
```jsx
// src/components/cart/CartItem.jsx
// src/components/cart/CartSummary.jsx
```

#### 6. Review Components (2 files)
```jsx
// src/components/reviews/ReviewForm.jsx
// src/components/reviews/ReviewList.jsx
```

### Pages cần tạo:

#### Customer Pages (9 files)
```jsx
// src/pages/HomePage.jsx - Trang chủ
// src/pages/BookListPage.jsx - Danh sách sách
// src/pages/BookDetailPage.jsx - Chi tiết sách
// src/pages/CartPage.jsx - Giỏ hàng
// src/pages/CheckoutPage.jsx - Thanh toán
// src/pages/LoginPage.jsx - Đăng nhập
// src/pages/RegisterPage.jsx - Đăng ký
// src/pages/ProfilePage.jsx - Trang cá nhân
// src/pages/OrderHistoryPage.jsx - Lịch sử đơn hàng
// src/pages/PaymentSuccessPage.jsx - Thanh toán thành công
// src/pages/PaymentFailPage.jsx - Thanh toán thất bại
```

#### Admin Pages (5 files)
```jsx
// src/pages/admin/AdminDashboard.jsx - Dashboard
// src/pages/admin/AdminBooks.jsx - Quản lý sách
// src/pages/admin/AdminOrders.jsx - Quản lý đơn hàng
// src/pages/admin/AdminCoupons.jsx - Quản lý coupon
// src/pages/admin/AdminUsers.jsx - Quản lý users
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 2. Tạo file .env
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Chạy development server
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc thư mục hoàn chỉnh

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   └── store.js ✅
│   ├── features/
│   │   ├── auth/
│   │   │   └── authSlice.js ✅
│   │   ├── books/
│   │   │   └── bookSlice.js ✅
│   │   ├── cart/
│   │   │   └── cartSlice.js ✅
│   │   ├── orders/
│   │   │   └── orderSlice.js ✅
│   │   ├── categories/
│   │   │   └── categorySlice.js ✅
│   │   └── coupons/
│   │       └── couponSlice.js ✅
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx ❌
│   │   │   ├── Footer.jsx ❌
│   │   │   └── Navbar.jsx ❌
│   │   ├── books/
│   │   │   ├── BookCard.jsx ❌
│   │   │   ├── BookList.jsx ❌
│   │   │   ├── BookFilter.jsx ❌
│   │   │   └── BookSearch.jsx ❌
│   │   ├── cart/
│   │   │   ├── CartItem.jsx ❌
│   │   │   └── CartSummary.jsx ❌
│   │   ├── reviews/
│   │   │   ├── ReviewForm.jsx ❌
│   │   │   └── ReviewList.jsx ❌
│   │   ├── common/
│   │   │   ├── Loader.jsx ❌
│   │   │   ├── Message.jsx ❌
│   │   │   ├── Pagination.jsx ❌
│   │   │   ├── Rating.jsx ❌
│   │   │   └── Modal.jsx ❌
│   │   ├── PrivateRoute.jsx ❌
│   │   └── AdminRoute.jsx ❌
│   ├── pages/
│   │   ├── HomePage.jsx ❌
│   │   ├── BookListPage.jsx ❌
│   │   ├── BookDetailPage.jsx ❌
│   │   ├── CartPage.jsx ❌
│   │   ├── CheckoutPage.jsx ❌
│   │   ├── LoginPage.jsx ❌
│   │   ├── RegisterPage.jsx ❌
│   │   ├── ProfilePage.jsx ❌
│   │   ├── OrderHistoryPage.jsx ❌
│   │   ├── PaymentSuccessPage.jsx ❌
│   │   ├── PaymentFailPage.jsx ❌
│   │   └── admin/
│   │       ├── AdminDashboard.jsx ❌
│   │       ├── AdminBooks.jsx ❌
│   │       ├── AdminOrders.jsx ❌
│   │       ├── AdminCoupons.jsx ❌
│   │       └── AdminUsers.jsx ❌
│   ├── services/
│   │   └── api.js ✅
│   ├── App.jsx ✅
│   ├── main.jsx ✅
│   └── index.css ✅
├── .gitignore ✅
├── index.html ✅
├── package.json ✅
├── vite.config.js ✅
├── tailwind.config.js ✅
├── postcss.config.js ✅
└── README.md ✅
```

## 🎨 Design Guidelines

### Colors
- Primary: Blue (#0ea5e9)
- Success: Green
- Error: Red
- Warning: Yellow

### Components Style
- Rounded corners: `rounded-lg`
- Shadows: `shadow-md`
- Hover effects: `hover:shadow-lg transition-all`

## 📌 Tính năng chính

### Customer Features
- ✅ Browse books with search & filter
- ✅ View book details & reviews
- ✅ Add to cart & manage cart
- ✅ Apply coupon codes
- ✅ Checkout with multiple payment methods
- ✅ View order history
- ✅ User profile management

### Admin Features
- ✅ Dashboard with statistics
- ✅ Manage books (CRUD)
- ✅ Manage orders
- ✅ Manage coupons
- ✅ Manage users

## 🔧 Utilities & Helpers

### Format Price
```javascript
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};
```

### Format Date
```javascript
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};
```

## 📝 Notes

- Backend API phải chạy trước ở port 5000
- Vite proxy sẽ forward `/api/*` requests tới backend
- Redux state được persist vào localStorage cho cart
- JWT token được lưu trong localStorage
- Tailwind CSS được config với custom colors

## 🎯 Next Steps

Bạn cần tạo các components và pages còn lại theo cấu trúc trên. Mỗi component nên:
1. Import dependencies cần thiết
2. Sử dụng Redux hooks (useSelector, useDispatch)
3. Implement responsive design với Tailwind
4. Handle loading & error states
5. Add proper form validation

Tôi có thể giúp bạn tạo từng component cụ thể nếu cần!
