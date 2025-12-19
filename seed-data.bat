@echo off
echo ========================================
echo  Seeding Test Data for Bookstore
echo ========================================
echo.

cd backend
node scripts/seed-test-data.js

echo.
echo Press any key to exit...
pause > nul
