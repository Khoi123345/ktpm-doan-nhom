import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import { createDriver, quitDriver, takeScreenshot } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import config from '../config.js';

describe('Debug Admin Login', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login as admin and verify role', async function() {
        console.log('\n=== DEBUG ADMIN LOGIN ===');
        
        // CLEAR ALL STORAGE FIRST
        console.log('0. Clear all storage...');
        await driver.get(`${config.adminUrl}`);
        await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
        console.log('   ✅ Storage cleared');
        
        console.log('\n1. Navigate to admin login page...');
        console.log('   URL:', `${config.adminUrl}/login`);
        
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);
        
        let currentUrl = await driver.getCurrentUrl();
        console.log('   Current URL after navigation:', currentUrl);
        
        // Take screenshot
        await takeScreenshot(driver, 'admin-login-page');
        console.log('   Screenshot saved: admin-login-page');
        
        console.log('\n2. Fill in admin credentials...');
        console.log('   Email:', config.admin.email);
        console.log('   Password: ****');
        
        const emailInput = await waitForElement(driver, By.css('input[type="email"]'));
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);
        
        const loginButton = await driver.findElement(By.css('button[type="submit"]'));
        
        console.log('\n3. Click login button...');
        await loginButton.click();
        
        await driver.sleep(5000);
        
        currentUrl = await driver.getCurrentUrl();
        console.log('\n4. After login:');
        console.log('   Current URL:', currentUrl);
        
        await takeScreenshot(driver, 'after-admin-login');
        console.log('   Screenshot saved: after-admin-login');
        
        // Check localStorage
        const userInfoStr = await driver.executeScript('return localStorage.getItem("userInfo")');
        console.log('\n5. LocalStorage userInfo:');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            console.log('   Email:', userInfo.email);
            console.log('   Name:', userInfo.name);
            console.log('   Role:', userInfo.role);
            console.log('   Has Token:', !!userInfo.token);
            
            // Verify role
            expect(userInfo.role).to.equal('admin');
            console.log('   ✅ Role is admin');
        } else {
            console.log('   ❌ No userInfo in localStorage');
            throw new Error('Login failed - no userInfo');
        }
        
        // Check page title/content
        const pageTitle = await driver.getTitle();
        console.log('\n6. Page info:');
        console.log('   Title:', pageTitle);
        
        // Try to find admin-specific elements
        console.log('\n7. Looking for admin elements...');
        try {
            const dashboardElements = await driver.findElements(By.xpath("//*[contains(text(), 'Dashboard') or contains(text(), 'Thống kê') or contains(text(), 'Quản lý')]"));
            if (dashboardElements.length > 0) {
                console.log('   ✅ Found', dashboardElements.length, 'admin-related elements');
            } else {
                console.log('   ❌ No admin elements found');
            }
        } catch (err) {
            console.log('   ❌ Error finding admin elements:', err.message);
        }
        
        // Check if we're on admin route
        if (currentUrl.includes('/admin/')) {
            console.log('\n✅ SUCCESS: On admin route');
        } else {
            console.log('\n❌ FAILURE: Not on admin route');
            console.log('   Expected URL to include: /admin/');
            console.log('   Actual URL:', currentUrl);
            
            // Get page source for debugging
            const bodyText = await driver.findElement(By.tagName('body')).getText();
            console.log('\n   Page content preview:', bodyText.substring(0, 200));
        }
    });
});
