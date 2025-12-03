# Backend Unit Tests

## Cấu trúc thư mục tests

```
tests/
├── controllers/          # Tests cho 9 controllers
│   ├── authController.test.js
│   ├── bookController.test.js
│   ├── cartController.test.js
│   ├── categoryController.test.js
│   ├── couponController.test.js
│   ├── orderController.test.js
│   ├── paymentController.test.js
│   ├── reviewController.test.js
│   └── userController.test.js
├── middlewares/          # Tests cho 4 middlewares
│   ├── adminMiddleware.test.js
│   ├── authMiddleware.test.js
│   ├── errorMiddleware.test.js
│   └── uploadMiddleware.test.js
├── utils/                # Tests cho 2 utils
│   ├── cloudinaryUpload.test.js
│   └── generateToken.test.js
└── helpers/              # Helper functions cho testing
    └── testHelpers.js
```

## Danh sách Unit Tests

### Controllers (9 files)
- ✅ `authController.test.js` - Đăng ký, đăng nhập, profile
- ✅ `bookController.test.js` - CRUD sách, tìm kiếm, upload ảnh
- ✅ `cartController.test.js` - Quản lý giỏ hàng
- ✅ `categoryController.test.js` - CRUD danh mục
- ✅ `couponController.test.js` - CRUD & validate mã giảm giá
- ✅ `orderController.test.js` - Tạo đơn, cập nhật trạng thái, hủy đơn
- ✅ `paymentController.test.js` - Xử lý thanh toán MoMo
- ✅ `reviewController.test.js` - CRUD đánh giá
- ✅ `userController.test.js` - Quản lý user (admin)

### Middlewares (4 files)
- ✅ `authMiddleware.test.js` - Xác thực JWT token
- ✅ `adminMiddleware.test.js` - Kiểm tra quyền admin
- ✅ `errorMiddleware.test.js` - Xử lý lỗi
- ✅ `uploadMiddleware.test.js` - Validate file upload

### Utils (2 files)
- ✅ `generateToken.test.js` - Tạo JWT token
- ✅ `cloudinaryUpload.test.js` - Upload ảnh lên Cloudinary

## Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests và xem kết quả real-time
npm run test:watch

# Chạy test cho một file cụ thể
npm test -- tests/utils/generateToken.test.js

# Chạy test cho một thư mục cụ thể
npm test -- tests/controllers/
```

## Coverage Report

Sau khi chạy `npm test`, báo cáo coverage sẽ được tạo trong thư mục `coverage/`.

Mở file `coverage/lcov-report/index.html` trong browser để xem báo cáo chi tiết.

## Test Helpers

File `tests/helpers/testHelpers.js` chứa các mock functions:
- `mockRequest()` - Mock Express request
- `mockResponse()` - Mock Express response  
- `mockNext()` - Mock Express next function
- `mockUser()` - Mock user object
- `mockBook()` - Mock book object
- `mockCart()` - Mock cart object
- `mockOrder()` - Mock order object
- `mockCategory()` - Mock category object
- `mockCoupon()` - Mock coupon object
- `mockReview()` - Mock review object

## Lưu ý

- Tất cả tests sử dụng Jest framework
- Mocking được thực hiện với `jest.mock()`
- Tests được tổ chức theo cấu trúc thư mục rõ ràng
- Mỗi test file cover cả success cases, error cases và edge cases
