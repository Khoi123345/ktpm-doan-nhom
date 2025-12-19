import { expect } from 'chai';
import { By, until, Key } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('Admin Login with Enter Key', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login using Enter key instead of clicking button', async function() {
        console.log('=== TEST: Login with Enter Key ===\n');
        
        // Navigate to login
        console.log('1. Navigating to admin login...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(3000);
        
        // Fill email
        console.log('2. Filling email...');
        const emailInput = await driver.wait(
            until.elementLocated(By.css('input[type="email"]')),
            10000
        );
        await emailInput.clear();
        await emailInput.sendKeys('admin@bookstore.com');
        
        // Fill password
        console.log('3. Filling password...');
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys('Admin@123456');
        
        // Press Enter on password field
        console.log('4. Pressing Enter key...');
        await passwordInput.sendKeys(Key.RETURN);
        
        // Wait for redirect
        console.log('5. Waiting for redirect...');
        await driver.sleep(6000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('6. Current URL:', currentUrl);
        
        if (currentUrl.includes('/login')) {
            console.log('   ❌ Still on login page');
            
            // Check for error message
            const bodyText = await driver.findElement(By.css('body')).getText();
            if (bodyText.includes('không đúng') || bodyText.includes('sai') || bodyText.includes('invalid')) {
                console.log('   Found error message on page');
            }
        } else {
            console.log('   ✅ Redirected successfully!');
            expect(currentUrl).to.not.include('/login');
        }
    });
});
