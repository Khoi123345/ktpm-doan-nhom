# Selenium Tests - Local Mode (với giao diện browser)

## Yêu cầu
1. **Node.js 20+** đã cài đặt
2. **Google Chrome** đã cài đặt
3. **ChromeDriver** tự động tải qua selenium-manager

## Setup

### 1. Cài đặt dependencies
```powershell
cd selenium-tests
npm install
```

### 2. Đảm bảo backend và frontend đang chạy
```powershell
# Terminal 1: Chạy MongoDB + Backend + Frontend
docker compose up
```

Kiểm tra:
- Frontend Customer: http://localhost:3000
- Frontend Admin: http://localhost:3001
- Backend API: http://localhost:5000/api/health

### 3. Chạy tests với giao diện browser

#### Chạy tất cả tests:
```powershell
cd selenium-tests
$env:HEADLESS="false"; npm test
```

#### Chạy từng test file:
```powershell
# Home page tests
$env:HEADLESS="false"; npm run test:home

# Login tests  
$env:HEADLESS="false"; npm run test:login
```

#### Chạy song song (nhanh hơn):
```powershell
$env:HEADLESS="false"; npm run test:parallel
```

## Xem tests chạy trực quan

Khi chạy với `HEADLESS=false`, bạn sẽ thấy:
- ✅ Chrome browser mở ra
- ✅ Các thao tác điền form, click button
- ✅ Điều hướng giữa các trang
- ✅ Tests chạy từng bước một

## Troubleshooting

### Lỗi: ChromeDriver not found
```powershell
# Cài đặt ChromeDriver thủ công
npm install -g chromedriver
```

### Lỗi: Connection refused
- Kiểm tra `docker compose ps` - đảm bảo frontend đang chạy
- Thử truy cập http://localhost:3000 trên browser

### Tests chạy quá nhanh
Tăng delay trong config.js:
```javascript
export default {
  headless: false,
  defaultTimeout: 10000,  // Tăng lên 10s
  // ...
}
```

## So sánh: Local vs Docker

| Feature | Local (có UI) | Docker (headless) |
|---------|---------------|-------------------|
| Nhìn thấy browser | ✅ Có | ❌ Không |
| Tốc độ | Nhanh hơn | Chậm hơn |
| Debug dễ | ✅ Rất dễ | ❌ Khó hơn |
| CI/CD | ❌ Không dùng | ✅ Dùng được |
| Screenshot | Có, nhưng không cần thiết | ✅ Cần thiết |

## Kết quả

Tests sẽ tạo:
- `reports/test-report.html` - HTML report
- `reports/test-report.json` - JSON data
- `reports/screenshots/` - Screenshots khi fail
