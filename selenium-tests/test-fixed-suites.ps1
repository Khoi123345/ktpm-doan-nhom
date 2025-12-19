# Comprehensive Test Runner for Fixed Tests
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Testing Fixed Selenium Test Suites" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

$env:HEADLESS='true'
$env:BASE_URL='http://localhost:3000'
$env:ADMIN_URL='http://localhost:3001'

cd C:\Users\Hoquo\OneDrive\Desktop\KTPM_doan\ktpm-doan-nhom\selenium-tests

# Test 1: E2E Admin Create Book (Already Working)
Write-Host "1. Testing E2E Admin Create Book..." -ForegroundColor Yellow
$result1 = npx mocha tests/e2e-admin-create-book.spec.js --timeout 90000 --reporter json 2>&1 | Out-String
if ($result1 -match '"failures":\s*0') {
    Write-Host "   ✓ PASS" -ForegroundColor Green
} else {
    Write-Host "   ✗ FAIL" -ForegroundColor Red
}

# Test 2: Admin Books
Write-Host "`n2. Testing Admin Books..." -ForegroundColor Yellow
$result2 = npx mocha tests/admin-books.spec.js --timeout 90000 --reporter json 2>&1 | Out-String
if ($result2 -match '"failures":\s*0') {
    Write-Host "   ✓ PASS - All tests passed" -ForegroundColor Green
} elseif ($result2 -match '"passes":\s*(\d+).*"failures":\s*(\d+)') {
    $passes = $matches[1]
    $failures = $matches[2]
    Write-Host "   ⚠ PARTIAL - $passes passed, $failures failed" -ForegroundColor Yellow
} else {
    Write-Host "   ✗ FAIL - Tests failed" -ForegroundColor Red
}

# Test 3: Admin Dashboard
Write-Host "`n3. Testing Admin Dashboard..." -ForegroundColor Yellow
$result3 = npx mocha tests/admin-dashboard.spec.js --timeout 90000 --reporter json 2>&1 | Out-String
if ($result3 -match '"failures":\s*0') {
    Write-Host "   ✓ PASS - All tests passed" -ForegroundColor Green
} elseif ($result3 -match '"passes":\s*(\d+).*"failures":\s*(\d+)') {
    $passes = $matches[1]
    $failures = $matches[2]
    Write-Host "   ⚠ PARTIAL - $passes passed, $failures failed" -ForegroundColor Yellow
} else {
    Write-Host "   ✗ FAIL - Tests failed" -ForegroundColor Red
}

# Test 4: Customer Cart
Write-Host "`n4. Testing Customer Cart..." -ForegroundColor Yellow
$result4 = npx mocha tests/customer-cart.spec.js --timeout 90000 --reporter json 2>&1 | Out-String
if ($result4 -match '"failures":\s*0') {
    Write-Host "   ✓ PASS - All tests passed" -ForegroundColor Green
} elseif ($result4 -match '"passes":\s*(\d+).*"failures":\s*(\d+)') {
    $passes = $matches[1]
    $failures = $matches[2]
    Write-Host "   ⚠ PARTIAL - $passes passed, $failures failed" -ForegroundColor Yellow
} else {
    Write-Host "   ✗ FAIL - Tests failed" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

Write-Host "All admin and customer tests have been updated with:" -ForegroundColor White
Write-Host "  ✓ Enter key login method" -ForegroundColor Green
Write-Host "  ✓ Input field clearing" -ForegroundColor Green
Write-Host "  ✓ Increased wait times" -ForegroundColor Green
Write-Host "`nFiles Updated:" -ForegroundColor White
Write-Host "  - admin-books.spec.js" -ForegroundColor Cyan
Write-Host "  - admin-dashboard.spec.js" -ForegroundColor Cyan
Write-Host "  - admin-orders.spec.js" -ForegroundColor Cyan
Write-Host "  - customer-cart.spec.js" -ForegroundColor Cyan
Write-Host "  - customer-checkout.spec.js" -ForegroundColor Cyan
Write-Host "  - customer-profile.spec.js" -ForegroundColor Cyan
Write-Host ""
