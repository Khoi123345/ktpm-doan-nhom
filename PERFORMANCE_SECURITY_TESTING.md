# Performance & Security Testing Guide

Hướng dẫn chi tiết để thực hiện **Performance Testing** và **Security Testing** cho dự án Bookstore.

---

## 📋 Mục lục

1. [Cài đặt](#cài-đặt)
2. [Performance Testing](#performance-testing)
3. [Security Testing](#security-testing)
4. [Chạy Tests](#chạy-tests)
5. [Đọc kết quả](#đọc-kết-quả)

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

## 🔒 Security Testing

### Giới thiệu

Security tests sử dụng **Jest + Supertest** để kiểm tra:
- ✅ Authentication mechanism
- ✅ Authorization & role-based access control (RBAC)
- ✅ Protected routes
- ✅ Token security (JWT)
- ✅ Password security
- ✅ Input validation
- ✅ IDOR (Insecure Direct Object Reference)
- ✅ Privilege escalation prevention
- ✅ Session management
- ✅ Data exposure prevention

### Các test suites

#### 1. **security.test.js**

**Tests bao gồm:**

**A. Authentication Mechanism**
- ❌ Reject login with incorrect password
- ❌ Reject login with non-existent user
- ❌ Reject requests without token
- ❌ Reject requests with invalid token
- ❌ Reject requests with expired token
- ✅ Accept valid token

**B. Password Security**
- Passwords are hashed (bcrypt)
- Passwords not returned in API responses
- Weak passwords rejected
- Password validation rules

**C. Session Management**
- Token expiration works correctly
- Modified tokens rejected
- Token in correct format only

**D. SQL/NoSQL Injection Prevention**
- Prevent NoSQL injection attempts
- Input sanitization
- Query parameter validation

**E. Role-Based Access Control (RBAC)**
- ✅ Admin can access admin routes
- ❌ Regular users cannot access admin routes
- ✅ Admin can create/update/delete books
- ❌ Regular users cannot modify books
- Resource ownership validation

**F. Protected Routes**
- All protected routes require authentication
- Public routes accessible without auth
- Proper 401/403 status codes

**G. Data Exposure Prevention**
- No sensitive data in error messages
- No stack traces exposed
- No internal system details revealed

**H. Input Validation & Sanitization**
- Email format validation
- Data type validation
- XSS prevention
- Malicious input rejection

#### 2. **authorization.test.js**

**Tests bao gồm:**

**A. Insecure Direct Object Reference (IDOR)**
- ❌ Users cannot access other users' orders
- ❌ Users cannot modify other users' data
- ✅ Users can only access their own resources
- Object ID guessing prevention

**B. Horizontal Privilege Escalation**
- Users cannot view other users' data
- Users only see their own orders
- API properly filters by user

**C. Vertical Privilege Escalation**
- ❌ Regular users cannot access admin functions
- ❌ Regular users cannot get user list
- ❌ Regular users cannot delete users
- Role enforcement in all routes

**D. Mass Assignment Vulnerability**
- ❌ Cannot set role via profile update
- ❌ Cannot modify protected fields
- Field whitelisting works

**E. Parameter Pollution**
- Duplicate parameters handled correctly
- Array parameter bypass prevention
- Filter bypass attempts blocked

**F. Token Tampering Prevention**
- Modified payload rejected or ignored
- Wrong secret rejected
- Malformed tokens rejected

**G. Token Expiration**
- Expired tokens rejected (401)
- Valid tokens accepted (200)

**H. Token Location Security**
- Token only accepted in Authorization header
- Query parameter token rejected
- Body token rejected

### Chạy Security Tests

**Chạy tất cả security tests:**
```bash
npm run test:security
```

**Chạy một file cụ thể:**
```bash
npm test tests/security/security.test.js
```

```bash
npm test tests/security/authorization.test.js
```

**Chạy với watch mode (tự động re-run khi code thay đổi):**
```bash
npm run test:watch -- tests/security
```

### Đọc kết quả Security Test

Kết quả output:

```
PASS  tests/security/security.test.js
  Security Tests - Authentication
    Authentication Mechanism
      ✓ should reject login with incorrect password (125ms)
      ✓ should reject login with non-existent user (89ms)
      ✓ should reject requests without token (15ms)
      ✓ should reject requests with invalid token (18ms)
      ✓ should reject requests with expired token (1025ms)
      ✓ should accept valid token and return user data (45ms)
    Password Security
      ✓ should not return password in user responses (42ms)
      ✓ should reject weak passwords during registration (67ms)
      ✓ should hash passwords before storing (12ms)
    ...

  Security Tests - Authorization & Access Control
    Role-Based Access Control (RBAC)
      ✓ should allow admin to access admin routes (55ms)
      ✓ should deny regular user access to admin routes (48ms)
      ✓ should allow admin to create books (89ms)
      ✓ should deny regular user from creating books (52ms)
      ...

Test Suites: 2 passed, 2 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        12.456s
```

**Giải thích:**
- ✅ **Green checkmark**: Test passed - bảo mật hoạt động đúng
- ❌ **Red X**: Test failed - có lỗ hổng bảo mật, cần fix ngay
- **Số ms**: Thời gian chạy test

**Nếu có test failed:**
```
FAIL  tests/security/security.test.js
  ● Security Tests - Authentication › should reject requests without token

    expect(received).toBe(expected)
    
    Expected: 401
    Received: 200
    
    Người dùng vẫn truy cập được route mà không cần token!
```

---

## 🎯 Chạy All Tests

### Chạy từng loại test

```bash
# Performance tests
npm run test:performance
npm run test:performance:quick
npm run test:performance:spike

# Security tests  
npm run test:security

# Unit + Integration tests (đã có)
npm test
```

### Tạo báo cáo đầy đủ

```bash
# 1. Chạy performance test (kết quả lưu trong report.json)
npm run test:performance

# 2. Chạy security tests
npm run test:security

# 3. Chạy full test suite với coverage
npm test
```

### Script tự động (PowerShell)

Tạo file `run-all-tests.ps1`:

```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Running All Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "."

Write-Host "[2/4] Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n[3/4] Running Performance Tests..." -ForegroundColor Yellow
npm run test:performance:quick

Write-Host "`n[4/4] Running Security Tests..." -ForegroundColor Yellow
npm run test:security


Write-Host "`nPerformance results saved to: tests/performance/report.json" -ForegroundColor Cyan
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   All Tests Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
```

Chạy:
```bash
./run-all-tests.ps1
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

### Security Test Coverage

✅ **Must Pass** (100% required):
- Authentication rejection tests
- Authorization & RBAC tests
- Token security tests
- IDOR prevention tests

⚠️ **Should Pass** (important but may vary):
- Input validation tests
- Rate limiting tests
- Data exposure tests

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

### Security Tests Issues

**Problem:** Tests failing với "Cannot find module"
```bash
# Solution:
npm install
```

**Problem:** MongoDB connection issues
```bash
# Tests sử dụng mongodb-memory-server, không cần MongoDB chạy
# Nếu vẫn lỗi:
npm install mongodb-memory-server --save-dev
```

**Problem:** All auth tests failing
- Kiểm tra JWT_SECRET trong `.env`
- Kiểm tra bcrypt hash function
- Xem logs chi tiết: `npm test -- --verbose`

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

### Security Testing

1. **Chạy security tests thường xuyên**
   - Mỗi khi có code changes
   - Trước khi merge PR
   - Trong CI/CD pipeline

2. **Keep tests updated**
   - Thêm test khi có new features
   - Update test khi API changes
   - Follow OWASP Top 10

3. **Test both positive and negative cases**
   - ✅ Valid credentials should work
   - ❌ Invalid credentials should fail
   - ❌ Attacks should be blocked

4. **Don't only rely on automated tests**
   - Manual penetration testing
   - Code review
   - Security audit

---

## 🎓 Tài liệu tham khảo

### Performance Testing
- [Artillery Documentation](https://artillery.io/docs/)
- [Load Testing Best Practices](https://artillery.io/docs/guides/overview/why-artillery.html)

### Security Testing
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📝 Checklist

### Trước khi deploy production

**Performance:**
- [ ] p95 response time < 500ms
- [ ] p99 response time < 1000ms  
- [ ] Error rate < 1%
- [ ] Throughput > 20 req/s
- [ ] Spike test passed without crash
- [ ] Sustained load test passed (> 5 minutes)

**Security:**
- [ ] All authentication tests passed
- [ ] All authorization tests passed
- [ ] All RBAC tests passed
- [ ] Token security tests passed
- [ ] IDOR prevention tests passed
- [ ] Input validation tests passed
- [ ] No sensitive data exposure
- [ ] Passwords properly hashed
- [ ] SQL/NoSQL injection prevented

---

## 🤝 Contributing

Nếu bạn thêm API endpoints mới, hãy nhớ:

1. **Thêm vào performance tests** (`artillery-config.yml`)
   - Thêm scenario test endpoint mới
   - Set appropriate weight
   - Add assertions

2. **Thêm security tests** 
   - Test authentication nếu route protected
   - Test authorization nếu có role requirements
   - Test input validation
   - Test error handling

3. **Update documentation** này

---

## 📞 Support

Nếu có vấn đề khi chạy tests:
1. Check logs trong terminal
2. Xem [Troubleshooting](#troubleshooting) section
3. Tạo issue với detailed error message

---

**Happy Testing! 🚀**
