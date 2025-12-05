# Unit Testing Documentation

## Class: authController

### Feature: register
| Property | Value |
| :--- | :--- |
| **ID** | TC-AUTH-01 |
| **Hàm** | `register(req, res, next)` |
| **Mục đích** | Đăng ký người dùng mới |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `registerNewUserSuccessfully` | Kiểm tra đăng ký người dùng mới thành công | `req.body` với `name`, `email`, `password` hợp lệ | `res.status` là 201, `res.json` trả về `success: true` và thông tin user | `res.status` trả về 201, `res.json` trả về đúng data | Pass |
| `return400IfEmailAlreadyExists` | Kiểm tra trả về lỗi 400 nếu email đã tồn tại | `req.body` với `email` đã có trong DB | `res.status` là 400, gọi `next` với Error | `res.status` là 400, gọi `next` với Error | Pass |
| `return400IfUserCreationFails` | Kiểm tra trả về lỗi 400 nếu tạo user thất bại | `req.body` hợp lệ nhưng DB lỗi | `res.status` là 400, gọi `next` với Error | `res.status` là 400, gọi `next` với Error | Pass |

### Feature: login
| Property | Value |
| :--- | :--- |
| **ID** | TC-AUTH-02 |
| **Hàm** | `login(req, res, next)` |
| **Mục đích** | Đăng nhập người dùng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `loginUserWithValidCredentials` | Kiểm tra đăng nhập thành công với thông tin hợp lệ | `req.body` với `email`, `password` đúng | `res.json` trả về `success: true` và token | `res.json` trả về `success: true` và token | Pass |
| `return401IfEmailDoesNotExist` | Kiểm tra trả về lỗi 401 nếu email không tồn tại | `req.body` với `email` không có trong DB | `res.status` là 401, gọi `next` với Error | `res.status` là 401, gọi `next` với Error | Pass |
| `return401IfPasswordIsIncorrect` | Kiểm tra trả về lỗi 401 nếu mật khẩu sai | `req.body` với `password` sai | `res.status` là 401, gọi `next` với Error | `res.status` là 401, gọi `next` với Error | Pass |
| `return403IfAccountIsLocked` | Kiểm tra trả về lỗi 403 nếu tài khoản bị khóa | `req.body` với tài khoản bị khóa | `res.status` là 403, gọi `next` với Error | `res.status` là 403, gọi `next` với Error | Pass |

### Feature: getProfile
| Property | Value |
| :--- | :--- |
| **ID** | TC-AUTH-03 |
| **Hàm** | `getProfile(req, res, next)` |
| **Mục đích** | Lấy thông tin hồ sơ người dùng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnUserProfile` | Kiểm tra trả về thông tin user thành công | `req.user` có `_id` hợp lệ | `res.json` trả về `success: true` và thông tin user | `res.json` trả về `success: true` và thông tin user | Pass |
| `return404IfUserNotFound` | Kiểm tra trả về lỗi 404 nếu không tìm thấy user | `req.user` có `_id` không tồn tại | `res.status` là 404, gọi `next` với Error | `res.status` là 404, gọi `next` với Error | Pass |

### Feature: updateProfile
| Property | Value |
| :--- | :--- |
| **ID** | TC-AUTH-04 |
| **Hàm** | `updateProfile(req, res, next)` |
| **Mục đích** | Cập nhật thông tin hồ sơ người dùng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateUserProfileSuccessfully` | Kiểm tra cập nhật thông tin user thành công | `req.user` hợp lệ, `req.body` chứa thông tin cập nhật | `res.json` trả về `success: true` và thông tin đã cập nhật | `res.json` trả về `success: true` và thông tin đã cập nhật | Pass |
| `updatePasswordWhenProvided` | Kiểm tra cập nhật mật khẩu khi được cung cấp | `req.body` chứa `password` mới | User được lưu với mật khẩu mới | User được lưu với mật khẩu mới | Pass |
| `return404IfUserNotFound` | Kiểm tra trả về lỗi 404 nếu không tìm thấy user | `req.user` có `_id` không tồn tại | `res.status` là 404, gọi `next` với Error | `res.status` là 404, gọi `next` với Error | Pass |

---

## Class: bookController

### Feature: getBooks
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-01 |
| **Hàm** | `getBooks(req, res)` |
| **Mục đích** | Lấy danh sách sách (có phân trang, lọc) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnPaginatedBooks` | Kiểm tra trả về danh sách sách có phân trang | `req.query` với `page`, `limit` | `res.json` trả về danh sách sách và thông tin phân trang | `res.json` trả về danh sách sách và thông tin phân trang | Pass |
| `filterByKeyword` | Kiểm tra lọc sách theo từ khóa | `req.query` với `keyword` | `Book.find` được gọi với query `$or` theo title/author | `Book.find` được gọi với query `$or` theo title/author | Pass |
| `filterByCategory` | Kiểm tra lọc sách theo danh mục | `req.query` với `category` | `Book.find` được gọi với query `category` | `Book.find` được gọi với query `category` | Pass |
| `filterByPriceRange` | Kiểm tra lọc sách theo khoảng giá | `req.query` với `minPrice`, `maxPrice` | `Book.find` được gọi với query `$expr` so sánh giá | `Book.find` được gọi với query `$expr` so sánh giá | Pass |

### Feature: getBookById
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-02 |
| **Hàm** | `getBookById(req, res)` |
| **Mục đích** | Lấy chi tiết một cuốn sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnBookWhenFound` | Kiểm tra trả về sách khi tìm thấy | `req.params.id` hợp lệ | `res.json` trả về `success: true` và thông tin sách | `res.json` trả về `success: true` và thông tin sách | Pass |
| `return404WhenBookNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy sách | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | Pass |

### Feature: createBook
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-03 |
| **Hàm** | `createBook(req, res)` |
| **Mục đích** | Tạo mới một cuốn sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createBookSuccessfully` | Kiểm tra tạo sách thành công | `req.body` chứa thông tin sách hợp lệ | `res.status` là 201, `res.json` trả về sách mới tạo | `res.status` là 201, `res.json` trả về sách mới tạo | Pass |
| `useDefaultValuesForDiscountPriceAndLanguage` | Kiểm tra sử dụng giá trị mặc định cho discountPrice và language | `req.body` thiếu `discountPrice`, `language` | Sách được tạo với `discountPrice: 0` và `language: 'Tiếng Việt'` | Sách được tạo với `discountPrice: 0` và `language: 'Tiếng Việt'` | Pass |

### Feature: updateBook
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-04 |
| **Hàm** | `updateBook(req, res)` |
| **Mục đích** | Cập nhật thông tin sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateBookSuccessfully` | Kiểm tra cập nhật sách thành công | `req.params.id` hợp lệ, `req.body` chứa thông tin cập nhật | `res.json` trả về sách đã cập nhật | `res.json` trả về sách đã cập nhật | Pass |
| `handlePartialUpdatesCorrectly` | Kiểm tra chỉ cập nhật các trường được cung cấp | `req.body` chỉ chứa một số trường | Các trường không có trong `req.body` giữ nguyên giá trị cũ | Các trường không có trong `req.body` giữ nguyên giá trị cũ | Pass |
| `return404WhenBookNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy sách | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | Pass |

### Feature: deleteBook
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-05 |
| **Hàm** | `deleteBook(req, res)` |
| **Mục đích** | Xóa một cuốn sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteBookSuccessfully` | Kiểm tra xóa sách thành công | `req.params.id` hợp lệ, sách chưa có trong đơn hàng | `res.json` trả về message 'Đã xóa sách' | `res.json` trả về message 'Đã xóa sách' | Pass |
| `return400IfBookIsInOrders` | Kiểm tra trả về lỗi 400 nếu sách đã có trong đơn hàng | `req.params.id` của sách đã được đặt hàng | `res.status` là 400, ném lỗi không thể xóa | `res.status` là 400, ném lỗi không thể xóa | Pass |
| `return404WhenBookNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy sách | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | `res.status` là 404, ném lỗi 'Không tìm thấy sách' | Pass |

### Feature: getTopBooks
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-06 |
| **Hàm** | `getTopBooks(req, res)` |
| **Mục đích** | Lấy danh sách sách có đánh giá cao nhất |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnTopRatedBooks` | Kiểm tra trả về danh sách sách top rated | Không có input đặc biệt | `res.json` trả về danh sách sách đã sort theo rating | `res.json` trả về danh sách sách đã sort theo rating | Pass |

### Feature: getNewArrivals
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-07 |
| **Hàm** | `getNewArrivals(req, res)` |
| **Mục đích** | Lấy danh sách sách mới nhất |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnNewestBooks` | Kiểm tra trả về danh sách sách mới nhất | Không có input đặc biệt | `res.json` trả về danh sách sách đã sort theo ngày tạo | `res.json` trả về danh sách sách đã sort theo ngày tạo | Pass |

### Feature: uploadBookImages
| Property | Value |
| :--- | :--- |
| **ID** | TC-BOOK-08 |
| **Hàm** | `uploadBookImages(req, res)` |
| **Mục đích** | Upload ảnh cho sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `uploadImagesSuccessfully` | Kiểm tra upload ảnh thành công | `req.files` chứa danh sách file ảnh | `res.json` trả về danh sách URL ảnh từ Cloudinary | `res.json` trả về danh sách URL ảnh từ Cloudinary | Pass |
| `return400WhenNoFilesProvided` | Kiểm tra trả về lỗi 400 khi không có file | `req.files` rỗng | `res.status` là 400, ném lỗi 'Vui lòng chọn ảnh' | `res.status` là 400, ném lỗi 'Vui lòng chọn ảnh' | Pass |

---

## Class: orderController

### Feature: createOrder
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-01 |
| **Hàm** | `createOrder(req, res)` |
| **Mục đích** | Tạo đơn hàng mới |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createOrderSuccessfully` | Kiểm tra tạo đơn hàng thành công | `req.body` chứa thông tin đơn hàng hợp lệ | `res.status` là 201, `res.json` trả về đơn hàng mới | `res.status` là 201, `res.json` trả về đơn hàng mới | Pass |
| `return400WhenNoItems` | Kiểm tra trả về lỗi 400 khi không có sản phẩm | `req.body.orderItems` rỗng | `res.status` là 400, ném lỗi 'Không có sản phẩm trong đơn hàng' | `res.status` là 400, ném lỗi 'Không có sản phẩm trong đơn hàng' | Pass |
| `return400WhenStockIsInsufficient` | Kiểm tra trả về lỗi 400 khi không đủ hàng | `req.body` có sản phẩm vượt quá tồn kho | `res.status` là 400, ném lỗi không đủ số lượng | `res.status` là 400, ném lỗi không đủ số lượng | Pass |
| `incrementCouponUsageWhenCouponCodeIsProvided` | Kiểm tra tăng số lần dùng coupon | `req.body` có `couponCode` | Coupon `usedCount` tăng lên 1 | Coupon `usedCount` tăng lên 1 | Pass |

### Feature: getOrderById
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-02 |
| **Hàm** | `getOrderById(req, res)` |
| **Mục đích** | Lấy chi tiết đơn hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnOrderForOwner` | Kiểm tra trả về đơn hàng cho chủ sở hữu | `req.params.id` hợp lệ, `req.user` là chủ đơn | `res.json` trả về thông tin đơn hàng | `res.json` trả về thông tin đơn hàng | Pass |
| `return404WhenNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy đơn hàng' | `res.status` là 404, ném lỗi 'Không tìm thấy đơn hàng' | Pass |
| `return403WhenUnauthorized` | Kiểm tra trả về lỗi 403 khi không có quyền | `req.user` không phải chủ đơn và không phải admin | `res.status` là 403, ném lỗi 'Không có quyền truy cập' | `res.status` là 403, ném lỗi 'Không có quyền truy cập' | Pass |

### Feature: getMyOrders
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-03 |
| **Hàm** | `getMyOrders(req, res)` |
| **Mục đích** | Lấy danh sách đơn hàng của tôi |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnUserOrders` | Kiểm tra trả về danh sách đơn hàng của user | `req.user` hợp lệ | `res.json` trả về danh sách đơn hàng của user đó | `res.json` trả về danh sách đơn hàng của user đó | Pass |

### Feature: getOrders
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-04 |
| **Hàm** | `getOrders(req, res)` |
| **Mục đích** | Lấy danh sách đơn hàng (Admin) có phân trang |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllOrdersAdmin` | Kiểm tra trả về danh sách đơn hàng có phân trang | User là admin, `req.query` với `page`, `limit` | `res.json` trả về danh sách đơn hàng có phân trang | `res.json` trả về danh sách đơn hàng có phân trang | Pass |

### Feature: updateOrderStatus
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-05 |
| **Hàm** | `updateOrderStatus(req, res)` |
| **Mục đích** | Cập nhật trạng thái đơn hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateOrderStatusAndReduceStockWhenConfirmed` | Kiểm tra cập nhật trạng thái và trừ tồn kho khi xác nhận | `req.body.status` là 'confirmed' | Trạng thái đơn hàng đổi, tồn kho sách giảm | Trạng thái đơn hàng đổi, tồn kho sách giảm | Pass |
| `restoreStockWhenCancelledIfPreviouslyConfirmed` | Kiểm tra hoàn tồn kho khi hủy đơn đã xác nhận | `req.body.status` là 'cancelled', đơn cũ 'confirmed' | Trạng thái đơn hàng đổi, tồn kho sách tăng lại | Trạng thái đơn hàng đổi, tồn kho sách tăng lại | Pass |
| `restoreCouponUsageWhenCancelled` | Kiểm tra hoàn lượt dùng coupon khi hủy đơn | `req.body.status` là 'cancelled', đơn có coupon | `usedCount` của coupon giảm đi 1 | `usedCount` của coupon giảm đi 1 | Pass |

### Feature: updateOrderToPaid
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-06 |
| **Hàm** | `updateOrderToPaid(req, res)` |
| **Mục đích** | Cập nhật trạng thái thanh toán |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateOrderToPaid` | Kiểm tra cập nhật đã thanh toán | `req.body` chứa thông tin thanh toán | `isPaid` thành true, `paidAt` được set | `isPaid` thành true, `paidAt` được set | Pass |
| `return404WhenOrderNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy đơn | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy đơn hàng' | `res.status` là 404, ném lỗi 'Không tìm thấy đơn hàng' | Pass |

### Feature: cancelOrder
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-07 |
| **Hàm** | `cancelOrder(req, res)` |
| **Mục đích** | Hủy đơn hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cancelOrderSuccessfullyPendingStatusNoStockRestore` | Kiểm tra hủy đơn pending thành công (không hoàn kho) | Đơn hàng đang pending | Trạng thái thành 'cancelled', không gọi save sách | Trạng thái thành 'cancelled', không gọi save sách | Pass |
| `cancelOrderAndRestoreStockConfirmedStatus` | Kiểm tra hủy đơn confirmed thành công (có hoàn kho) | Đơn hàng đang confirmed | Trạng thái thành 'cancelled', tồn kho sách tăng lại | Trạng thái thành 'cancelled', tồn kho sách tăng lại | Pass |
| `return400WhenAlreadyDelivered` | Kiểm tra không thể hủy đơn đã giao | Đơn hàng đang delivered | `res.status` là 400, ném lỗi không thể hủy | `res.status` là 400, ném lỗi không thể hủy | Pass |
| `restoreCouponUsageWhenCancelled` | Kiểm tra hoàn lượt dùng coupon khi hủy | Đơn có coupon | `usedCount` của coupon giảm đi 1 | `usedCount` của coupon giảm đi 1 | Pass |
| `return403WhenUnauthorizedToCancel` | Kiểm tra không có quyền hủy đơn người khác | `req.user` không phải chủ đơn | `res.status` là 403, ném lỗi không có quyền | `res.status` là 403, ném lỗi không có quyền | Pass |

### Feature: returnOrder
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-08 |
| **Hàm** | `returnOrder(req, res)` |
| **Mục đích** | Hoàn trả đơn hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnOrderAndRestoreStock` | Kiểm tra hoàn trả đơn hàng và hoàn kho | Đơn hàng đã giao | Trạng thái thành 'returned', tồn kho sách tăng lại | Trạng thái thành 'returned', tồn kho sách tăng lại | Pass |
| `return400IfAlreadyReturned` | Kiểm tra không thể hoàn trả đơn đã hoàn/hủy | Đơn hàng đã returned | `res.status` là 400, ném lỗi | `res.status` là 400, ném lỗi | Pass |

### Feature: getTopSellingBooks
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-09 |
| **Hàm** | `getTopSellingBooks(req, res)` |
| **Mục đích** | Lấy danh sách sách bán chạy |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnTopSellingBooks` | Kiểm tra trả về danh sách sách bán chạy | Không có input đặc biệt | `res.json` trả về data từ aggregation | `res.json` trả về data từ aggregation | Pass |

### Feature: getTopBuyers
| Property | Value |
| :--- | :--- |
| **ID** | TC-ORDER-10 |
| **Hàm** | `getTopBuyers(req, res)` |
| **Mục đích** | Lấy danh sách người mua nhiều nhất |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnTopBuyers` | Kiểm tra trả về danh sách top buyers | Không có input đặc biệt | `res.json` trả về data từ aggregation | `res.json` trả về data từ aggregation | Pass |

---

## Class: userController

### Feature: getAllUsers
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-01 |
| **Hàm** | `getAllUsers(req, res)` |
| **Mục đích** | Lấy danh sách tất cả người dùng (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllUsers` | Kiểm tra trả về danh sách user | User là admin | `res.json` trả về danh sách user | `res.json` trả về danh sách user | Pass |

### Feature: getUserById
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-02 |
| **Hàm** | `getUserById(req, res)` |
| **Mục đích** | Lấy thông tin chi tiết người dùng (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnUserWhenFound` | Kiểm tra trả về user khi tìm thấy | `req.params.id` hợp lệ | `res.json` trả về thông tin user | `res.json` trả về thông tin user | Pass |
| `return404WhenNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | Pass |

### Feature: updateUser
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-03 |
| **Hàm** | `updateUser(req, res)` |
| **Mục đích** | Cập nhật thông tin người dùng (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateUserSuccessfully` | Kiểm tra cập nhật user thành công | `req.body` chứa thông tin cập nhật | `res.json` trả về thông tin user đã cập nhật | `res.json` trả về thông tin user đã cập nhật | Pass |
| `handlePartialUpdates` | Kiểm tra chỉ cập nhật các trường được cung cấp | `req.body` chỉ chứa một số trường | Các trường khác giữ nguyên | Các trường khác giữ nguyên | Pass |
| `return404WhenNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | Pass |

### Feature: deleteUser
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-04 |
| **Hàm** | `deleteUser(req, res)` |
| **Mục đích** | Xóa người dùng (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteUserSuccessfully` | Kiểm tra xóa user thành công | `req.params.id` hợp lệ, không phải admin | `res.json` trả về message 'Đã xóa người dùng' | `res.json` trả về message 'Đã xóa người dùng' | Pass |
| `return400WhenTryingToDeleteAdmin` | Kiểm tra không thể xóa tài khoản admin | `req.params.id` là của admin | `res.status` là 400, ném lỗi không thể xóa admin | `res.status` là 400, ném lỗi không thể xóa admin | Pass |
| `return404WhenNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | Pass |

### Feature: changePassword
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-05 |
| **Hàm** | `changePassword(req, res)` |
| **Mục đích** | Đổi mật khẩu |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `changePasswordSuccessfully` | Kiểm tra đổi mật khẩu thành công | `oldPassword` đúng, `newPassword` hợp lệ | Mật khẩu được cập nhật, `res.json` trả về success | Mật khẩu được cập nhật, `res.json` trả về success | Pass |
| `return401IfOldPasswordIsIncorrect` | Kiểm tra lỗi khi mật khẩu cũ sai | `oldPassword` sai | `res.status` là 401, ném lỗi 'Mật khẩu cũ không đúng' | `res.status` là 401, ném lỗi 'Mật khẩu cũ không đúng' | Pass |
| `return400IfNewPasswordIsTooShort` | Kiểm tra lỗi khi mật khẩu mới quá ngắn | `newPassword` < 8 ký tự | `res.status` là 400, ném lỗi độ dài | `res.status` là 400, ném lỗi độ dài | Pass |
| `return400IfNewPasswordLacksComplexity` | Kiểm tra lỗi khi mật khẩu mới không đủ phức tạp | `newPassword` đơn giản | `res.status` là 400, ném lỗi độ phức tạp | `res.status` là 400, ném lỗi độ phức tạp | Pass |
| `return404IfUserNotFound` | Kiểm tra lỗi khi không tìm thấy user | `req.user` không tồn tại | `res.status` là 404, ném lỗi | `res.status` là 404, ném lỗi | Pass |

### Feature: toggleUserLock
| Property | Value |
| :--- | :--- |
| **ID** | TC-USER-06 |
| **Hàm** | `toggleUserLock(req, res)` |
| **Mục đích** | Khóa/Mở khóa tài khoản (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lockUserSuccessfully` | Kiểm tra khóa tài khoản thành công | User đang active | `isLocked` thành true | `isLocked` thành true | Pass |
| `unlockUserSuccessfully` | Kiểm tra mở khóa tài khoản thành công | User đang locked | `isLocked` thành false | `isLocked` thành false | Pass |
| `return400WhenTryingToLockAdmin` | Kiểm tra không thể khóa tài khoản admin | User là admin | `res.status` là 400, ném lỗi không thể khóa admin | `res.status` là 400, ném lỗi không thể khóa admin | Pass |
| `return404WhenNotFound` | Kiểm tra trả về lỗi 404 khi không tìm thấy | `req.params.id` không tồn tại | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | `res.status` là 404, ném lỗi 'Không tìm thấy người dùng' | Pass |

---

## Class: cartController

### Feature: getCart
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-01 |
| **Hàm** | `getCart(req, res)` |
| **Mục đích** | Lấy thông tin giỏ hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnExistingCart` | Kiểm tra trả về giỏ hàng đã tồn tại | `req.user` hợp lệ | `res.json` trả về giỏ hàng | `res.json` trả về giỏ hàng | Pass |
| `createNewCartIfNotExists` | Kiểm tra tạo mới giỏ hàng nếu chưa có | `req.user` chưa có giỏ hàng | `Cart.create` được gọi, trả về giỏ mới | `Cart.create` được gọi, trả về giỏ mới | Pass |

### Feature: addToCart
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-02 |
| **Hàm** | `addToCart(req, res)` |
| **Mục đích** | Thêm sản phẩm vào giỏ hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `addNewItemToCart` | Kiểm tra thêm sản phẩm mới vào giỏ | `req.body` với `bookId`, `quantity` | Item được thêm vào `cart.items` | Item được thêm vào `cart.items` | Pass |
| `updateQuantityForExistingItem` | Kiểm tra cập nhật số lượng cho sản phẩm đã có | `req.body` với `bookId` đã có trong giỏ | Số lượng item tăng lên | Số lượng item tăng lên | Pass |
| `return404WhenBookNotFound` | Kiểm tra lỗi khi không tìm thấy sách | `bookId` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |
| `return400WhenStockInsufficient` | Kiểm tra lỗi khi không đủ tồn kho | `quantity` > `stock` | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return400WhenMissingRequiredFields` | Kiểm tra lỗi khi thiếu thông tin | Thiếu `bookId` | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |

### Feature: updateCartItem
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-03 |
| **Hàm** | `updateCartItem(req, res)` |
| **Mục đích** | Cập nhật số lượng sản phẩm trong giỏ |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateItemQuantity` | Kiểm tra cập nhật số lượng thành công | `req.params.bookId`, `req.body.quantity` | Số lượng item thay đổi | Số lượng item thay đổi | Pass |
| `return400WhenQuantityExceedsStock` | Kiểm tra lỗi khi số lượng vượt quá tồn kho | `quantity` > `stock` | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return404WhenCartNotFound` | Kiểm tra lỗi khi không tìm thấy giỏ hàng | User chưa có giỏ hàng | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: removeFromCart
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-04 |
| **Hàm** | `removeFromCart(req, res)` |
| **Mục đích** | Xóa sản phẩm khỏi giỏ hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `removeItemFromCart` | Kiểm tra xóa sản phẩm thành công | `req.params.bookId` có trong giỏ | Item bị xóa khỏi `cart.items` | Item bị xóa khỏi `cart.items` | Pass |
| `return404WhenCartNotFound` | Kiểm tra lỗi khi không tìm thấy giỏ hàng | User chưa có giỏ hàng | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: removeMultipleFromCart
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-05 |
| **Hàm** | `removeMultipleFromCart(req, res)` |
| **Mục đích** | Xóa nhiều sản phẩm khỏi giỏ hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `removeMultipleItems` | Kiểm tra xóa nhiều sản phẩm thành công | `req.body.itemIds` là mảng id | Các item bị xóa khỏi `cart.items` | Các item bị xóa khỏi `cart.items` | Pass |
| `return400WhenInvalidData` | Kiểm tra lỗi khi dữ liệu không hợp lệ | `itemIds` không phải mảng | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |

### Feature: clearCart
| Property | Value |
| :--- | :--- |
| **ID** | TC-CART-06 |
| **Hàm** | `clearCart(req, res)` |
| **Mục đích** | Xóa toàn bộ giỏ hàng |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `clearAllItemsFromCart` | Kiểm tra xóa toàn bộ sản phẩm | `req.user` có giỏ hàng | `cart.items` rỗng, `totalItems` = 0 | `cart.items` rỗng, `totalItems` = 0 | Pass |
| `createCartIfNotExists` | Kiểm tra tạo giỏ mới nếu chưa có | `req.user` chưa có giỏ hàng | `Cart.create` được gọi | `Cart.create` được gọi | Pass |

---

## Class: categoryController

### Feature: getCategories
| Property | Value |
| :--- | :--- |
| **ID** | TC-CAT-01 |
| **Hàm** | `getCategories(req, res)` |
| **Mục đích** | Lấy danh sách thể loại |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllCategories` | Kiểm tra trả về tất cả thể loại | Không có input đặc biệt | `res.json` trả về danh sách category | `res.json` trả về danh sách category | Pass |

### Feature: getCategoryById
| Property | Value |
| :--- | :--- |
| **ID** | TC-CAT-02 |
| **Hàm** | `getCategoryById(req, res)` |
| **Mục đích** | Lấy chi tiết thể loại |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnCategoryWhenFound` | Kiểm tra trả về thể loại khi tìm thấy | `req.params.id` hợp lệ | `res.json` trả về category | `res.json` trả về category | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: createCategory
| Property | Value |
| :--- | :--- |
| **ID** | TC-CAT-03 |
| **Hàm** | `createCategory(req, res)` |
| **Mục đích** | Tạo thể loại mới |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createCategorySuccessfully` | Kiểm tra tạo thể loại thành công | `req.body` hợp lệ | `res.status` 201, trả về category mới | `res.status` 201, trả về category mới | Pass |
| `return400IfCategoryAlreadyExists` | Kiểm tra lỗi khi thể loại đã tồn tại | Tên thể loại đã có trong DB | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |

### Feature: updateCategory
| Property | Value |
| :--- | :--- |
| **ID** | TC-CAT-04 |
| **Hàm** | `updateCategory(req, res)` |
| **Mục đích** | Cập nhật thể loại |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateCategorySuccessfully` | Kiểm tra cập nhật thành công | `req.params.id`, `req.body` | Category được cập nhật và lưu | Category được cập nhật và lưu | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: deleteCategory
| Property | Value |
| :--- | :--- |
| **ID** | TC-CAT-05 |
| **Hàm** | `deleteCategory(req, res)` |
| **Mục đích** | Xóa thể loại |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteCategorySuccessfully` | Kiểm tra xóa thành công | `req.params.id` hợp lệ | `category.deleteOne` được gọi | `category.deleteOne` được gọi | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

---

## Class: couponController

### Feature: getCoupons
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-01 |
| **Hàm** | `getCoupons(req, res)` |
| **Mục đích** | Lấy danh sách mã giảm giá (Public) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllCoupons` | Kiểm tra trả về tất cả mã giảm giá | Không có input đặc biệt | `res.json` trả về danh sách coupon | `res.json` trả về danh sách coupon | Pass |

### Feature: getAllCoupons
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-02 |
| **Hàm** | `getAllCoupons(req, res)` |
| **Mục đích** | Lấy danh sách tất cả mã giảm giá (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllCouponsWithPopulatedData` | Kiểm tra trả về tất cả mã giảm giá kèm thông tin người tạo | Không có input đặc biệt | `res.json` trả về danh sách coupon có populate `createdBy` | `res.json` trả về danh sách coupon có populate `createdBy` | Pass |

### Feature: getCouponByCode
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-03 |
| **Hàm** | `getCouponByCode(req, res)` |
| **Mục đích** | Lấy thông tin mã giảm giá theo code |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnCouponWhenFound` | Kiểm tra trả về mã giảm giá khi tìm thấy | `req.params.code` hợp lệ | `res.json` trả về coupon | `res.json` trả về coupon | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.code` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: validateCoupon
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-04 |
| **Hàm** | `validateCoupon(req, res)` |
| **Mục đích** | Kiểm tra tính hợp lệ của mã giảm giá |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `validateActiveCoupon` | Kiểm tra mã giảm giá hợp lệ | `code` đúng, `orderValue` đủ | `res.json` trả về thông tin giảm giá | `res.json` trả về thông tin giảm giá | Pass |
| `return404WhenCouponNotFound` | Kiểm tra lỗi khi mã không tồn tại | `code` sai | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |
| `return400WhenCouponExpired` | Kiểm tra lỗi khi mã hết hạn | `code` hết hạn | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return400WhenUsageLimitReached` | Kiểm tra lỗi khi hết lượt sử dụng | `code` hết lượt | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return400WhenMinimumOrderNotMet` | Kiểm tra lỗi khi đơn hàng chưa đủ giá trị | `orderValue` < `minOrderValue` | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return400WhenCouponIsInactive` | Kiểm tra lỗi khi mã bị vô hiệu hóa | `isActive` false | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return400WhenCouponHasNotStartedYet` | Kiểm tra lỗi khi mã chưa đến ngày bắt đầu | `startDate` trong tương lai | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `calculatePercentageDiscountCorrectly` | Kiểm tra tính giảm giá theo phần trăm | `discountType` percentage | `discountAmount` tính đúng theo % | `discountAmount` tính đúng theo % | Pass |
| `calculateFixedAmountDiscountCorrectly` | Kiểm tra tính giảm giá theo số tiền cố định | `discountType` fixed | `discountAmount` đúng bằng `discountValue` | `discountAmount` đúng bằng `discountValue` | Pass |

### Feature: createCoupon
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-05 |
| **Hàm** | `createCoupon(req, res)` |
| **Mục đích** | Tạo mã giảm giá mới |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createCouponSuccessfully` | Kiểm tra tạo mã thành công | `req.body` hợp lệ | `res.status` 201 | `res.status` 201 | Pass |
| `return400WhenCodeAlreadyExists` | Kiểm tra lỗi khi mã đã tồn tại | `code` trùng | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `saveCouponCodeInUppercase` | Kiểm tra lưu mã in hoa | `code` chữ thường | Mã được lưu dạng in hoa | Mã được lưu dạng in hoa | Pass |

### Feature: updateCoupon
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-06 |
| **Hàm** | `updateCoupon(req, res)` |
| **Mục đích** | Cập nhật mã giảm giá |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateCouponSuccessfully` | Kiểm tra cập nhật thành công | `req.params.id`, `req.body` | Coupon được cập nhật | Coupon được cập nhật | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: deleteCoupon
| Property | Value |
| :--- | :--- |
| **ID** | TC-COUPON-07 |
| **Hàm** | `deleteCoupon(req, res)` |
| **Mục đích** | Xóa mã giảm giá |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteCouponSuccessfully` | Kiểm tra xóa thành công | `req.params.id` hợp lệ | `coupon.deleteOne` được gọi | `coupon.deleteOne` được gọi | Pass |
| `return400WhenCouponIsUsedInAnOrder` | Kiểm tra lỗi khi mã đã được sử dụng | Mã đã có trong đơn hàng | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |
| `return404WhenNotFound` | Kiểm tra lỗi khi không tìm thấy | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

---

## Class: paymentController

### Feature: createMoMoPaymentUrl
| Property | Value |
| :--- | :--- |
| **ID** | TC-PAY-01 |
| **Hàm** | `createMoMoPaymentUrl(req, res)` |
| **Mục đích** | Tạo URL thanh toán MoMo |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createMoMoPaymentSuccessfully` | Kiểm tra tạo URL thanh toán thành công | `req.body.orderId` hợp lệ | `res.json` trả về `paymentUrl` | `res.json` trả về `paymentUrl` | Pass |
| `return404WhenOrderNotFound` | Kiểm tra lỗi khi không tìm thấy đơn hàng | `orderId` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |
| `return400WhenMoMoCreationFails` | Kiểm tra lỗi khi tạo thanh toán thất bại | MoMo API trả lỗi | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |

### Feature: momoReturn
| Property | Value |
| :--- | :--- |
| **ID** | TC-PAY-02 |
| **Hàm** | `momoReturn(req, res)` |
| **Mục đích** | Xử lý redirect từ MoMo sau thanh toán |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `handleSuccessfulPaymentReturn` | Kiểm tra xử lý thanh toán thành công | `req.body` hợp lệ, signature đúng | Order `isPaid` = true, redirect success | Order `isPaid` = true, redirect success | Pass |
| `redirectToFailWhenSignatureIsInvalid` | Kiểm tra redirect lỗi khi chữ ký sai | `signature` sai | Redirect fail | Redirect fail | Pass |
| `redirectToFailWhenPaymentResultIsNotSuccess` | Kiểm tra redirect lỗi khi thanh toán thất bại | `resultCode` != 0 | Redirect fail | Redirect fail | Pass |

### Feature: momoIPN
| Property | Value |
| :--- | :--- |
| **ID** | TC-PAY-03 |
| **Hàm** | `momoIPN(req, res)` |
| **Mục đích** | Xử lý IPN từ MoMo |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `handleSuccessfulIPN` | Kiểm tra xử lý IPN thành công | `req.body` hợp lệ, signature đúng | Order `isPaid` = true, `res.json` success | Order `isPaid` = true, `res.json` success | Pass |
| `return97WhenSignatureIsInvalid` | Kiểm tra trả về lỗi 97 khi chữ ký sai | `signature` sai | `res.json` resultCode 97 | `res.json` resultCode 97 | Pass |
| `return1WhenPaymentResultIsNotSuccess` | Kiểm tra trả về lỗi 1 khi thanh toán thất bại | `resultCode` != 0 | `res.json` resultCode 1 | `res.json` resultCode 1 | Pass |
| `notUpdateOrderIfAlreadyPaid` | Kiểm tra không cập nhật lại nếu đã thanh toán | Order đã `isPaid` | Order không save lại | Order không save lại | Pass |

---

## Class: reviewController

### Feature: getBookReviews
| Property | Value |
| :--- | :--- |
| **ID** | TC-REVIEW-01 |
| **Hàm** | `getBookReviews(req, res)` |
| **Mục đích** | Lấy danh sách đánh giá của sách |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllReviewsForABook` | Kiểm tra trả về tất cả review của sách | `req.params.id` hợp lệ | `res.json` trả về danh sách review | `res.json` trả về danh sách review | Pass |

### Feature: createReview
| Property | Value |
| :--- | :--- |
| **ID** | TC-REVIEW-02 |
| **Hàm** | `createReview(req, res)` |
| **Mục đích** | Tạo đánh giá mới |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createReviewSuccessfully` | Kiểm tra tạo review thành công | `req.body` hợp lệ | `res.status` 201, book rating updated | `res.status` 201, book rating updated | Pass |
| `return404WhenBookNotFound` | Kiểm tra lỗi khi không tìm thấy sách | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |
| `return400WhenAlreadyReviewed` | Kiểm tra lỗi khi đã đánh giá rồi | User đã review sách này | `res.status` 400, ném lỗi | `res.status` 400, ném lỗi | Pass |

### Feature: updateReview
| Property | Value |
| :--- | :--- |
| **ID** | TC-REVIEW-03 |
| **Hàm** | `updateReview(req, res)` |
| **Mục đích** | Cập nhật đánh giá |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `updateReviewSuccessfully` | Kiểm tra cập nhật review thành công | `req.params.id`, `req.body` | Review updated, book rating updated | Review updated, book rating updated | Pass |
| `allowAdminToUpdateResponse` | Kiểm tra admin trả lời review | Admin user, `req.body.response` | Review response updated | Review response updated | Pass |
| `return401WhenUnauthorized` | Kiểm tra lỗi khi không có quyền | User khác sửa review | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `return404WhenReviewNotFound` | Kiểm tra lỗi khi không tìm thấy review | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: deleteReview
| Property | Value |
| :--- | :--- |
| **ID** | TC-REVIEW-04 |
| **Hàm** | `deleteReview(req, res)` |
| **Mục đích** | Xóa đánh giá |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteReviewSuccessfully` | Kiểm tra xóa review thành công | `req.params.id` hợp lệ | Review deleted, book rating updated | Review deleted, book rating updated | Pass |
| `allowAdminToDeleteAnyReview` | Kiểm tra admin xóa review bất kỳ | Admin user | Review deleted | Review deleted | Pass |
| `return401WhenUnauthorized` | Kiểm tra lỗi khi không có quyền | User khác xóa review | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `return404WhenReviewNotFound` | Kiểm tra lỗi khi không tìm thấy review | `req.params.id` không tồn tại | `res.status` 404, ném lỗi | `res.status` 404, ném lỗi | Pass |

### Feature: getAllReviews
| Property | Value |
| :--- | :--- |
| **ID** | TC-REVIEW-05 |
| **Hàm** | `getAllReviews(req, res)` |
| **Mục đích** | Lấy tất cả đánh giá (Admin) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnAllReviewsAdmin` | Kiểm tra trả về tất cả review | Admin user | `res.json` trả về danh sách review | `res.json` trả về danh sách review | Pass |

---

## Class: adminMiddleware

### Feature: admin
| Property | Value |
| :--- | :--- |
| **ID** | TC-MW-ADMIN-01 |
| **Hàm** | `admin(req, res, next)` |
| **Mục đích** | Middleware kiểm tra quyền Admin |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `allowAccessForAdminUser` | Cho phép truy cập với admin | `req.user.role` = 'admin' | `next()` được gọi | `next()` được gọi | Pass |
| `denyAccessForCustomerUser` | Từ chối truy cập với customer | `req.user.role` = 'customer' | `res.status` 403, ném lỗi | `res.status` 403, ném lỗi | Pass |
| `denyAccessWhenUserIsNotAuthenticated` | Từ chối khi chưa đăng nhập | `req.user` null | `res.status` 403, ném lỗi | `res.status` 403, ném lỗi | Pass |
| `denyAccessForUserWithoutRole` | Từ chối khi user không có role | `req.user.role` undefined | `res.status` 403, ném lỗi | `res.status` 403, ném lỗi | Pass |

---

## Class: authMiddleware

### Feature: protect
| Property | Value |
| :--- | :--- |
| **ID** | TC-MW-AUTH-01 |
| **Hàm** | `protect(req, res, next)` |
| **Mục đích** | Middleware xác thực người dùng (JWT) |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `authenticateUserWithValidToken` | Xác thực thành công với token hợp lệ | Header Authorization Bearer token | `req.user` được gán, `next()` được gọi | `req.user` được gán, `next()` được gọi | Pass |
| `rejectRequestWithoutAuthorizationHeader` | Từ chối khi không có header | Không có header Authorization | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `rejectRequestWithInvalidTokenFormat` | Từ chối khi format token sai | Header không bắt đầu bằng Bearer | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `rejectRequestWithInvalidToken` | Từ chối khi token không hợp lệ | Token sai signature | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `rejectRequestWhenUserNotFound` | Từ chối khi user không tồn tại | Token hợp lệ nhưng user đã bị xóa | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |
| `rejectRequestWithExpiredToken` | Từ chối khi token hết hạn | Token hết hạn | `res.status` 401, ném lỗi | `res.status` 401, ném lỗi | Pass |

---

## Class: errorMiddleware

### Feature: notFound
| Property | Value |
| :--- | :--- |
| **ID** | TC-MW-ERR-01 |
| **Hàm** | `notFound(req, res, next)` |
| **Mục đích** | Xử lý lỗi 404 Not Found |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `create404ErrorWithCorrectMessage` | Tạo lỗi 404 đúng message | URL không tồn tại | `res.status` 404, `next` gọi với Error | `res.status` 404, `next` gọi với Error | Pass |

### Feature: errorHandler
| Property | Value |
| :--- | :--- |
| **ID** | TC-MW-ERR-02 |
| **Hàm** | `errorHandler(err, req, res, next)` |
| **Mục đích** | Xử lý lỗi chung |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `handleGenericErrors` | Xử lý lỗi thông thường | Error object | `res.status` 500, trả về json error | `res.status` 500, trả về json error | Pass |
| `use500StatusCodeWhenStatusCodeIs200` | Chuyển status 200 thành 500 khi có lỗi | `res.statusCode` đang là 200 | `res.status` 500 | `res.status` 500 | Pass |
| `notIncludeStackTraceInProduction` | Không hiện stack trace ở production | `NODE_ENV` = 'production' | `stack` là null | `stack` là null | Pass |
| `includeStackTraceInDevelopment` | Hiện stack trace ở development | `NODE_ENV` = 'development' | `stack` có giá trị | `stack` có giá trị | Pass |

---

## Class: uploadMiddleware

### Feature: uploadMiddleware
| Property | Value |
| :--- | :--- |
| **ID** | TC-MW-UPLOAD-01 |
| **Hàm** | `uploadMiddleware` |
| **Mục đích** | Middleware xử lý upload file |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `configureMulterWithMemoryStorage` | Cấu hình multer đúng | N/A | Storage là memory storage | Storage là memory storage | Pass |
| `acceptImageFiles` | Chấp nhận file ảnh | File mimetype image/jpeg | File được chấp nhận | File được chấp nhận | Pass |
| `rejectNonImageFiles` | Từ chối file không phải ảnh | File mimetype application/pdf | File bị từ chối, trả về lỗi | File bị từ chối, trả về lỗi | Pass |
| `setFileSizeLimitTo5MB` | Giới hạn dung lượng 5MB | N/A | Limit fileSize 5MB | Limit fileSize 5MB | Pass |

---

## Class: cloudinaryUpload

### Feature: uploadToCloudinary
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-CLOUD-01 |
| **Hàm** | `uploadToCloudinary(buffer, folder)` |
| **Mục đích** | Upload file lên Cloudinary |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `uploadFileSuccessfully` | Upload thành công | Buffer ảnh hợp lệ | Trả về URL ảnh | Trả về URL ảnh | Pass |
| `useDefaultFolderIfNotProvided` | Dùng folder mặc định nếu thiếu | Không truyền folder | Upload vào folder mặc định | Upload vào folder mặc định | Pass |
| `rejectOnUploadError` | Báo lỗi khi upload thất bại | Cloudinary lỗi | Ném lỗi | Ném lỗi | Pass |

### Feature: deleteFromCloudinary
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-CLOUD-02 |
| **Hàm** | `deleteFromCloudinary(url)` |
| **Mục đích** | Xóa file trên Cloudinary |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `deleteImageSuccessfully` | Xóa thành công | URL ảnh hợp lệ | `uploader.destroy` được gọi đúng publicId | `uploader.destroy` được gọi đúng publicId | Pass |
| `handleDeletionError` | Báo lỗi khi xóa thất bại | Cloudinary lỗi | Ném lỗi | Ném lỗi | Pass |
| `extractPublicIdCorrectlyFromComplexURL` | Lấy đúng publicId từ URL phức tạp | URL có subfolder | PublicId chính xác | PublicId chính xác | Pass |

---

## Class: generateToken

### Feature: generateToken
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-TOKEN-01 |
| **Hàm** | `generateToken(id)` |
| **Mục đích** | Tạo JWT token |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `generateValidJWTToken` | Tạo token hợp lệ | User ID | Token string, 3 phần | Token string, 3 phần | Pass |
| `encodeUserIdInToken` | Token chứa đúng User ID | User ID | Decoded token có id đúng | Decoded token có id đúng | Pass |
| `useConfiguredExpiryTime` | Dùng thời gian hết hạn trong config | `JWT_EXPIRE` set | Token hết hạn đúng thời gian | Token hết hạn đúng thời gian | Pass |
| `useDefaultExpiryIfJWTEXPIREIsNotSet` | Dùng thời gian mặc định nếu thiếu config | `JWT_EXPIRE` unset | Token hết hạn sau 30 ngày | Token hết hạn sau 30 ngày | Pass |
| `createDifferentTokensForDifferentUserIDs` | Token khác nhau cho user khác nhau | 2 User ID khác nhau | 2 Token khác nhau | 2 Token khác nhau | Pass |

---

## Class: momoHelper

### Feature: createMoMoPayment
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-MOMO-01 |
| **Hàm** | `createMoMoPayment(orderInfo)` |
| **Mục đích** | Tạo request thanh toán MoMo |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createPaymentRequestSuccessfully` | Tạo request thành công | `orderInfo` hợp lệ | Trả về response từ MoMo | Trả về response từ MoMo | Pass |
| `generateCorrectSignature` | Tạo chữ ký đúng | `orderInfo` hợp lệ | Signature khớp với tính toán | Signature khớp với tính toán | Pass |
| `throwErrorIfAxiosFails` | Báo lỗi khi gọi API thất bại | Network error | Ném lỗi | Ném lỗi | Pass |

### Feature: verifyMoMoSignature
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-MOMO-02 |
| **Hàm** | `verifyMoMoSignature(params)` |
| **Mục đích** | Xác thực chữ ký MoMo |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `returnTrueForValidSignature` | Trả về true nếu chữ ký đúng | Params có signature đúng | True | True | Pass |
| `returnFalseForInvalidSignature` | Trả về false nếu chữ ký sai | Params có signature sai | False | False | Pass |

### Feature: parseMoMoReturn
| Property | Value |
| :--- | :--- |
| **ID** | TC-UTIL-MOMO-03 |
| **Hàm** | `parseMoMoReturn(params)` |
| **Mục đích** | Parse kết quả trả về từ MoMo |

**Các trường hợp test:**

| Tên hàm test | Mô tả | Dữ liệu nhập | Kết quả mong đợi | Kết quả chạy | Failed/ Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `parseSuccessReturnDataCorrectly` | Parse kết quả thành công | Params success | Object có `isSuccess`: true | Object có `isSuccess`: true | Pass |
| `parseFailedReturnDataCorrectly` | Parse kết quả thất bại | Params fail | Object có `isSuccess`: false | Object có `isSuccess`: false | Pass |



