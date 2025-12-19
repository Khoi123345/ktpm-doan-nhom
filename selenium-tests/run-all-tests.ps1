# Run all Selenium tests and generate summary
$env:HEADLESS='true'
$env:BASE_URL='http://localhost:3000'
$env:ADMIN_URL='http://localhost:3001'

cd C:\Users\Hoquo\OneDrive\Desktop\KTPM_doan\ktpm-doan-nhom\selenium-tests

$testFiles = @(
    "admin-dashboard.spec.js",
    "admin-books.spec.js",
    "admin-orders.spec.js",
    "customer-books.spec.js",
    "customer-cart.spec.js",
    "customer-checkout.spec.js",
    "customer-profile.spec.js",
    "e2e-admin-create-book.spec.js",
    "home.spec.js",
    "login.spec.js"
)

$results = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Running Selenium Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($testFile in $testFiles) {
    Write-Host "Running $testFile..." -ForegroundColor Yellow
    
    $output = npx mocha "tests\$testFile" --timeout 60000 --reporter json 2>&1 | Out-String
    
    try {
        # Try to parse JSON from output
        $jsonStart = $output.IndexOf('{')
        if ($jsonStart -ge 0) {
            $jsonOutput = $output.Substring($jsonStart)
            $testResult = $jsonOutput | ConvertFrom-Json
            
            $results += [PSCustomObject]@{
                TestFile = $testFile
                Suites = $testResult.stats.suites
                Tests = $testResult.stats.tests
                Passes = $testResult.stats.passes
                Failures = $testResult.stats.failures
                Duration = [math]::Round($testResult.stats.duration / 1000, 2)
                Status = if ($testResult.stats.failures -eq 0) { "PASS" } else { "FAIL" }
            }
            
            $color = if ($testResult.stats.failures -eq 0) { "Green" } else { "Red" }
            Write-Host "  ✓ $($testResult.stats.passes) passed, ✗ $($testResult.stats.failures) failed" -ForegroundColor $color
        } else {
            Write-Host "  ✗ Could not parse results (test may have crashed)" -ForegroundColor Red
            $results += [PSCustomObject]@{
                TestFile = $testFile
                Suites = 0
                Tests = 0
                Passes = 0
                Failures = 1
                Duration = 0
                Status = "ERROR"
            }
        }
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{
            TestFile = $testFile
            Suites = 0
            Tests = 0
            Passes = 0
            Failures = 1
            Duration = 0
            Status = "ERROR"
        }
    }
    
    Write-Host ""
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

$totalTests = ($results | Measure-Object -Property Tests -Sum).Sum
$totalPasses = ($results | Measure-Object -Property Passes -Sum).Sum
$totalFailures = ($results | Measure-Object -Property Failures -Sum).Sum
$totalDuration = ($results | Measure-Object -Property Duration -Sum).Sum

Write-Host "`nOverall Results:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor White
Write-Host "  Passed: $totalPasses" -ForegroundColor Green
Write-Host "  Failed: $totalFailures" -ForegroundColor Red
Write-Host "  Duration: $totalDuration seconds" -ForegroundColor White
Write-Host ""

if ($totalFailures -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
}
