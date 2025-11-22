# Hệ thống Nhà sách Trực tuyến

## Tổng quan Dự án
Dự án này là một ứng dụng web thương mại điện tử được thiết kế cho một nhà sách trực tuyến. Hệ thống được xây dựng sử dụng MERN Stack (MongoDB, Express.js, React, Node.js) và cung cấp đầy đủ các chức năng cho cả khách hàng và quản trị viên, bao gồm duyệt sản phẩm, quản lý giỏ hàng, xử lý đơn hàng và tích hợp thanh toán.

## Công nghệ Sử dụng

### Backend
-   **Môi trường thực thi**: Node.js
-   **Framework**: Express.js
-   **Cơ sở dữ liệu**: MongoDB với Mongoose ODM
-   **Xác thực**: JSON Web Tokens (JWT)
-   **Lưu trữ đa phương tiện**: Cloudinary
-   **Cổng thanh toán**: VNPay, MoMo
-   **Bảo mật**: Bcrypt để mã hóa mật khẩu

### Frontend
-   **Thư viện**: React 18
-   **Công cụ Build**: Vite
-   **Styling**: Tailwind CSS
-   **Quản lý trạng thái**: Redux Toolkit
-   **Routing**: React Router v6
-   **HTTP Client**: Axios
-   **Xử lý Form**: React Hook Form

## Tính năng Hệ thống

### Các Module Backend
Kiến trúc backend bao gồm các module cốt lõi sau:
-   **Xác thực & Phân quyền**: Đăng ký và đăng nhập người dùng an toàn sử dụng JWT và kiểm soát truy cập dựa trên vai trò.
-   **Quản lý Người dùng**: Các thao tác CRUD cho hồ sơ người dùng và giám sát người dùng của quản trị viên.
-   **Quản lý Sách**: Quản lý danh mục đầy đủ bao gồm thêm, cập nhật, xóa và tìm kiếm sách.
-   **Quản lý Danh mục**: Tổ chức sách theo các danh mục.
-   **Quản lý Đơn hàng**: Xử lý đơn hàng của khách hàng, theo dõi trạng thái và lịch sử.
-   **Hệ thống Đánh giá**: Đánh giá và xếp hạng của khách hàng cho sản phẩm.
-   **Hệ thống Giảm giá**: Quản lý và xác thực mã giảm giá.
-   **Tích hợp Thanh toán**: Hỗ trợ thanh toán trực tuyến qua VNPay và MoMo, cũng như Thanh toán khi nhận hàng (COD).

### Các Module Frontend
Ứng dụng frontend cung cấp giao diện người dùng đáp ứng (responsive) với các tính năng sau:
-   **Trang chủ**: Trưng bày các sách nổi bật và nội dung khuyến mãi.
-   **Danh mục Sản phẩm**: Duyệt và tìm kiếm sách với các tùy chọn lọc.
-   **Chi tiết Sản phẩm**: Xem chi tiết thông tin sách, bao gồm đánh giá và xếp hạng.
-   **Giỏ hàng**: Quản lý các mặt hàng đã chọn và điều chỉnh số lượng.
-   **Quy trình Thanh toán**: Đặt hàng an toàn và lựa chọn phương thức thanh toán.
-   **Hồ sơ Người dùng**: Quản lý thông tin cá nhân và lịch sử đơn hàng.
-   **Bảng điều khiển Quản trị (Admin Dashboard)**: Giao diện toàn diện để quản lý sách, đơn hàng, người dùng và mã giảm giá.

## Cài đặt và Thiết lập

### Yêu cầu tiên quyết
-   Node.js (v14 trở lên)
-   npm (Node Package Manager)
-   Chuỗi kết nối MongoDB

### Cấu hình Backend
1.  Di chuyển đến thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file `.env` trong thư mục backend với cấu hình sau:
    ```env
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    CLOUDINARY_CLOUD_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_key
    CLOUDINARY_API_SECRET=your_cloudinary_secret
    VNPAY_TMN_CODE=your_vnpay_code
    VNPAY_HASH_SECRET=your_vnpay_secret
    MOMO_PARTNER_CODE=your_momo_code
    MOMO_ACCESS_KEY=your_momo_access_key
    MOMO_SECRET_KEY=your_momo_secret_key
    FRONTEND_URL=http://localhost:3000
    ```
4.  Khởi động server backend:
    ```bash
    npm run dev
    ```

### Cấu hình Frontend
1.  Di chuyển đến thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file `.env` trong thư mục frontend:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Khởi động server phát triển frontend:
    ```bash
    npm run dev
    ```

## Tài liệu API

### Xác thực (Authentication)
-   `POST /api/auth/register`: Đăng ký người dùng mới.
-   `POST /api/auth/login`: Xác thực người dùng và trả về token.
-   `GET /api/auth/profile`: Lấy hồ sơ của người dùng đã xác thực.
-   `PUT /api/auth/profile`: Cập nhật hồ sơ của người dùng đã xác thực.

### Sách (Books)
-   `GET /api/books`: Lấy danh sách sách với phân trang và lọc.
-   `GET /api/books/:id`: Lấy chi tiết của một cuốn sách cụ thể.
-   `POST /api/books`: Thêm sách mới (Chỉ Admin).
-   `PUT /api/books/:id`: Cập nhật sách hiện có (Chỉ Admin).
-   `DELETE /api/books/:id`: Xóa sách (Chỉ Admin).

### Đơn hàng (Orders)
-   `POST /api/orders`: Tạo đơn hàng mới.
-   `GET /api/orders/myorders`: Lấy lịch sử đơn hàng của người dùng đã xác thực.
-   `GET /api/orders/:id`: Lấy chi tiết của một đơn hàng cụ thể.
-   `GET /api/orders`: Lấy tất cả đơn hàng (Chỉ Admin).

### Thanh toán (Payment)
-   `POST /api/payment/vnpay/create`: Khởi tạo giao dịch thanh toán VNPay.
-   `POST /api/payment/momo/create`: Khởi tạo giao dịch thanh toán MoMo.

## Triển khai Bảo mật
Hệ thống triển khai một số biện pháp bảo mật để bảo vệ dữ liệu người dùng và đảm bảo tính toàn vẹn của hệ thống:
-   **Xác thực JWT**: Cơ chế xác thực không trạng thái (stateless) để truy cập API an toàn.
-   **Mã hóa Mật khẩu**: Mật khẩu người dùng được băm (hash) sử dụng Bcrypt trước khi lưu trữ.
-   **Kiểm soát Truy cập Dựa trên Vai trò (RBAC)**: Middleware đảm bảo rằng các thao tác nhạy cảm chỉ được giới hạn cho nhân sự được ủy quyền (Admin).
-   **Xác thực Đầu vào**: Tính toàn vẹn dữ liệu được duy trì thông qua việc xác thực nghiêm ngặt các yêu cầu đến.

## Giấy phép
Dự án này được cấp phép theo Giấy phép ISC.

---
**Lưu ý**: Phần mềm này được dùng cho mục đích giáo dục và minh họa.
