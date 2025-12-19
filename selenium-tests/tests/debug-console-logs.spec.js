import { expect } from 'chai';
import { By, until, logging } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('Debug Admin Login with Console Logs', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should capture console logs during login attempt', async function() {
        console.log('=== STARTING DEBUG TEST ===\n');
        
        // Step 1: Navigate to login
        console.log('1. Navigating to login page...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(3000);
        
        // Step 2: Fill form
        console.log('2. Filling login form...');
        const emailInput = await driver.wait(
            until.elementLocated(By.css('input[type="email"]')),
            10000
        );
        await emailInput.sendKeys('admin@bookstore.com');
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys('Admin@123456');
        
        // Step 3: Click submit
        console.log('3. Clicking submit button...');
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await submitBtn.click();
        
        // Wait a bit for network request
        await driver.sleep(5000);
        
        // Step 4: Get browser console logs
        console.log('\n4. Fetching browser console logs...');
        try {
            const logs = await driver.manage().logs().get(logging.Type.BROWSER);
            console.log('\n=== BROWSER CONSOLE LOGS ===');
            logs.forEach(entry => {
                console.log(`[${entry.level.name}] ${entry.message}`);
            });
            console.log('=== END CONSOLE LOGS ===\n');
        } catch (e) {
            console.log('Could not fetch console logs:', e.message);
        }
        
        // Step 5: Check for error messages on page
        console.log('5. Checking for error messages on page...');
        const bodyText = await driver.findElement(By.css('body')).getText();
        console.log('Page text (first 500 chars):', bodyText.substring(0, 500));
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('\n6. Final URL:', currentUrl);
        
        if (currentUrl.includes('/login')) {
            console.log('\n❌ STILL ON LOGIN PAGE - Possible issues:');
            console.log('   - API not responding');
            console.log('   - CORS error');
            console.log('   - Wrong credentials');
            console.log('   - Frontend not making request');
        } else {
            console.log('\n✅ Login successful!');
        }
    });
});
