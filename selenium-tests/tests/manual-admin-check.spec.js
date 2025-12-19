import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('Manual Admin Test', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should manually login admin and check URL', async function() {
        this.timeout(120000); // 2 minutes for manual observation
        
        console.log('\n========================================');
        console.log('MANUAL ADMIN LOGIN TEST');
        console.log('========================================');
        console.log('Admin URL:', config.adminUrl);
        console.log('Admin Email:', config.admin.email);
        console.log('Admin Password:', config.admin.password);
        console.log('========================================\n');
        
        // Step 1: Go to admin login
        console.log('Step 1: Going to admin login page (port 3001)...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(3000);
        
        let url = await driver.getCurrentUrl();
        console.log('Current URL:', url);
        console.log('Expected port: 3001');
        console.log('Actual port:', url.split(':')[2]?.split('/')[0]);
        
        // Step 2: Clear storage
        console.log('\nStep 2: Clearing localStorage...');
        await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
        await driver.sleep(1000);
        
        // Step 3: Pause for manual inspection
        console.log('\n========================================');
        console.log('🔍 BROWSER IS NOW OPEN');
        console.log('Please check:');
        console.log('1. Are you on port 3001?');
        console.log('2. Is this the login page?');
        console.log('3. Can you see the login form?');
        console.log('\nWaiting 10 seconds...');
        console.log('========================================\n');
        await driver.sleep(10000);
        
        // Step 4: Login
        console.log('Step 4: Filling login form...');
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.sendKeys(config.admin.email);
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys(config.admin.password);
        
        console.log('Credentials entered. Clicking login...');
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();
        
        // Step 5: Wait and check
        console.log('\nStep 5: Waiting for redirect...');
        await driver.sleep(5000);
        
        url = await driver.getCurrentUrl();
        console.log('\n========================================');
        console.log('AFTER LOGIN:');
        console.log('Current URL:', url);
        console.log('Port:', url.split(':')[2]?.split('/')[0]);
        console.log('Path:', url.split(':')[2]?.substring(4)); // Remove port number
        console.log('========================================\n');
        
        // Check localStorage
        const userInfoStr = await driver.executeScript('return localStorage.getItem("userInfo")');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            console.log('User Info from localStorage:');
            console.log('  Email:', userInfo.email);
            console.log('  Name:', userInfo.name);
            console.log('  Role:', userInfo.role);
            
            if (userInfo.role === 'admin') {
                console.log('  ✅ Role is ADMIN');
            } else {
                console.log('  ❌ Role is NOT admin:', userInfo.role);
            }
        } else {
            console.log('❌ No userInfo in localStorage');
        }
        
        // Check page content
        console.log('\nChecking page content...');
        const pageText = await driver.findElement(By.tagName('body')).getText();
        const hasAdminText = pageText.includes('Dashboard') || 
                            pageText.includes('Quản lý') || 
                            pageText.includes('Thống kê') ||
                            pageText.includes('Admin');
        const hasCustomerText = pageText.includes('Tất Cả Sách') || 
                               pageText.includes('TRANG CHỦ') ||
                               pageText.includes('Tìm kiếm');
        
        console.log('Has Admin content:', hasAdminText);
        console.log('Has Customer content:', hasCustomerText);
        
        // Pause for visual inspection
        console.log('\n========================================');
        console.log('🔍 PAUSING FOR VISUAL INSPECTION');
        console.log('Please look at the browser and verify:');
        console.log('1. Which interface do you see? (Admin or Customer)');
        console.log('2. What is the URL in the browser?');
        console.log('3. Are you on the correct port (3001)?');
        console.log('\nWaiting 30 seconds for inspection...');
        console.log('========================================\n');
        await driver.sleep(30000);
        
        // Final verification
        const finalUrl = await driver.getCurrentUrl();
        console.log('\n========================================');
        console.log('FINAL CHECK:');
        console.log('URL:', finalUrl);
        console.log('Should include /admin/:', finalUrl.includes('/admin/'));
        console.log('========================================\n');
    });
});
