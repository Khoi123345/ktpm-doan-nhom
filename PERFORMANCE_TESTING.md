# Performance Testing Guide

Hướng dẫn chi tiết để thực hiện **Performance Testing** cho dự án Bookstore.

---

## 📋 Mục lục

1. [Cài đặt](#cài-đặt)
2. [Performance Testing](#performance-testing)
3. [Chạy Tests](#chạy-tests)
4. [Đọc kết quả](#đọc-kết-quả)

---

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

Artillery đã được thêm vào `devDependencies`:
```json
"artillery": "^2.0.0"
```

### 2. Chuẩn bị môi trường test

Đảm bảo:
- MongoDB đang chạy
- Backend server đang chạy trên `http://localhost:5000`
- Đã có user admin và customer trong database

**Chạy server:**
```bash
npm run dev
```

---

## 📊 Performance Testing

### Giới thiệu Artillery

**Artillery** là công cụ load testing hiện đại cho API. Nó giúp:
- ✅ Đo thời gian phản hồi (response time)
- ✅ Test khả năng chịu tải (load testing)
- ✅ Test spike traffic (đột ngột tăng lưu lượng)
- ✅ Kiểm tra throughput (số requests/giây)
- ✅ Phát hiện bottlenecks

### Các test scenarios có sẵn

#### 1. **Full Load Test** (`artillery-config.yml`)

Test toàn diện với nhiều giai đoạn:
- Warm-up: 30s với 5 users/s
- Ramp-up: 60s tăng từ 10 → 50 users/s  
- Sustained: 120s giữ ổn định 50 users/s
- Peak: 60s tăng lên 100 users/s
- Cool-down: 30s giảm về 5 users/s

**Scenarios được test:**
- Browse & search books (50% traffic)
- User authentication (20% traffic)
- Shopping cart operations (15% traffic)
- View book details (10% traffic)
- Admin operations (5% traffic)

**Chạy test:**
```bash
npm run test:performance
```

**Kết quả được lưu tại:** `tests/performance/report.json`

**📝 Lưu ý:** Artillery đã ngừng hỗ trợ lệnh `artillery report`. Để xem báo cáo:
- Mở file `report.json` để xem raw data
- Hoặc dùng Artillery Cloud: `artillery run <file> --record` (miễn phí)

#### 2. **Quick Test** (`artillery-quick.yml`)

Test nhanh, chỉ 30 giây:
- Test các endpoint cơ bản
- Phù hợp cho development
- Kiểm tra nhanh sau khi code thay đổi

**Chạy test:**
```bash
npm run test:performance:quick
```

#### 3. **Spike Test** (`artillery-spike.yml`)

Test khả năng xử lý đột biến traffic:
- Normal: 30s với 10 users/s
- **Spike: 60s với 200 users/s** 
- Recovery: 30s về 10 users/s

**Chạy test:**
```bash
npm run test:performance:spike
```

### Đọc kết quả Performance Test

Sau khi chạy xong, bạn sẽ thấy output như sau:

```
Summary report @ 14:30:25(+0700)
  Scenarios launched:  1500
  Scenarios completed: 1500
  Requests completed:  4500
  Mean response/sec: 25.5
  Response time (msec):
    min: 45
    max: 892
    median: 120
    p95: 450
    p99: 720
  Scenario counts:
    Browse and Search Books: 750 (50%)
    User Authentication Flow: 300 (20%)
    ...
  Codes:
    200: 4350
    401: 100
    404: 50
  Errors:
    ETIMEDOUT: 0
```

**Các chỉ số quan trọng:**

| Chỉ số | Ý nghĩa | Ngưỡng tốt |
|--------|---------|------------|
| **p95** | 95% requests có response time dưới giá trị này | < 500ms |
| **p99** | 99% requests có response time dưới giá trị này | < 1000ms |
| **Mean response/sec** | Số requests xử lý được mỗi giây | > 20 |
| **Error rate** | Tỷ lệ lỗi | < 1% |
| **Max response time** | Thời gian phản hồi chậm nhất | < 2000ms |

### Xem kết quả test

**⚠️ Lưu ý:** Artillery v2 đã ngừng hỗ trợ lệnh `artillery report`.

**Cách xem kết quả:**

**Option 1: Đọc JSON report** (Đơn giản)
```bash
# Kết quả được lưu tại:
backend/tests/performance/report.json
```
Mở file này trong VS Code hoặc JSON viewer online.

**Option 2: Artillery Cloud** (Khuyến nghị - có UI đẹp)
```bash
# 1. Đăng ký miễn phí tại: https://app.artillery.io
# 2. Lấy API key
# 3. Chạy test với --record:
artillery run tests/performance/artillery-config.yml --record --key <your-api-key>
```

Ưu điểm Artillery Cloud:
- Báo cáo HTML đẹp với charts tương tác
- Lưu lịch sử các lần test
- So sánh performance giữa các versions
- Share report với team

**Option 3: Custom visualization**
- Sử dụng [jsoncrack.com](https://jsoncrack.com) để visualize JSON
- Hoặc viết script Python/Node.js để parse JSON và tạo charts

---

## 🎯 Chạy Tests

### Chạy các loại performance test

```bash
# Full load test
npm run test:performance

# Quick test
npm run test:performance:quick

# Spike test
npm run test:performance:spike
```

### Tạo báo cáo

```bash
# Chạy performance test (kết quả lưu trong report.json)
npm run test:performance
```

### Script tự động (PowerShell)

Tạo file `run-performance-tests.ps1`:

```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Running Performance Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "."

Write-Host "[2/3] Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n[3/3] Running Performance Tests..." -ForegroundColor Yellow
npm run test:performance:quick

Write-Host "`nPerformance results saved to: tests/performance/report.json" -ForegroundColor Cyan
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   Performance Tests Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
```

Chạy:
```bash
./run-performance-tests.ps1
```

---

## 📈 Benchmark & Thresholds

### Performance Thresholds (Ngưỡng chấp nhận)

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| **p95 response time** | < 200ms | < 500ms | > 500ms |
| **p99 response time** | < 500ms | < 1000ms | > 1000ms |
| **Error rate** | < 0.1% | < 1% | > 1% |
| **Throughput** | > 50 req/s | > 20 req/s | < 20 req/s |
| **Max response time** | < 1000ms | < 2000ms | > 2000ms |

---

## 🛠️ Troubleshooting

### Performance Tests Issues

**Problem:** Artillery not found
```bash
# Solution:
npm install -g artillery
# Or use from node_modules:
npx artillery run tests/performance/artillery-config.yml
```

**Problem:** Connection refused / ECONNREFUSED
```bash
# Solution: Đảm bảo server đang chạy
npm run dev
# Kiểm tra port:
curl http://localhost:5000/api/health
```

**Problem:** High error rate (> 10%)
- Server quá tải, giảm `arrivalRate` trong config
- Database connection limit, tăng connection pool
- Timeout quá thấp, tăng `timeout` value



---

## 📚 Best Practices

### Performance Testing

1. **Chạy test trên environment giống production**
   - Same hardware specs
   - Same database size
   - Same network conditions

2. **Warm up trước khi test chính thức**
   - Server cần thời gian để optimize (JIT, caching)
   - Database cần warm up connections

3. **Monitor server metrics đồng thời**
   - CPU usage
   - Memory usage
   - Database connections
   - Network I/O

4. **Test nhiều scenarios khác nhau**
   - Normal load
   - Peak load  
   - Spike traffic
   - Sustained load over time

---

## 🎓 Tài liệu tham khảo

- [Artillery Documentation](https://artillery.io/docs/)
- [Load Testing Best Practices](https://artillery.io/docs/guides/overview/why-artillery.html)

---

## 📝 Checklist

### Trước khi deploy production

- [ ] p95 response time < 500ms
- [ ] p99 response time < 1000ms  
- [ ] Error rate < 1%
- [ ] Throughput > 20 req/s
- [ ] Spike test passed without crash
- [ ] Sustained load test passed (> 5 minutes)

---

## 🤝 Contributing

Nếu bạn thêm API endpoints mới, hãy nhớ:

1. **Thêm vào performance tests** (`artillery-config.yml`)
   - Thêm scenario test endpoint mới
   - Set appropriate weight
   - Add assertions

2. **Update documentation** này

---

## 📞 Support

Nếu có vấn đề khi chạy tests:
1. Check logs trong terminal
2. Xem [Troubleshooting](#troubleshooting) section
3. Tạo issue với detailed error message

---

**Happy Testing! 🚀**
