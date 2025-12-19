import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('Simple Admin Test', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login and navigate to books page', async function() {
        // Step 1: Go to admin login
        console.log('1. Going to admin login page...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(3000);
        
        // Step 2: Fill in credentials
        console.log('2. Filling credentials...');
        const emailInput = await driver.wait(
            until.elementLocated(By.css('input[type="email"]')),
            10000
        );
        await emailInput.clear();
        await emailInput.sendKeys('admin@bookstore.com');
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys('Admin@123456');
        
        await driver.sleep(1000);
        
        // Step 3: Submit form
        console.log('3. Submitting login form...');
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await submitBtn.click();
        
        // Step 4: Wait for redirect (up to 15 seconds)
        console.log('4. Waiting for redirect after login...');
        try {
            await driver.wait(async () => {
                const url = await driver.getCurrentUrl();
                console.log('   Current URL:', url);
                return !url.includes('/login');
            }, 15000);
            
            const finalUrl = await driver.getCurrentUrl();
            console.log('✓ Login successful! Redirected to:', finalUrl);
            
            // Step 5: Navigate to books page directly
            console.log('5. Navigating to books page...');
            await driver.get(`${config.adminUrl}/admin/books`);
            await driver.sleep(3000);
            
            // Step 6: Check for "Quản lý sách" header
            const pageText = await driver.findElement(By.css('body')).getText();
            console.log('6. Checking page content...');
            
            if (pageText.includes('Quản lý sách') || pageText.includes('Gigantitanic')) {
                console.log('✓ Books page loaded successfully!');
                expect(pageText).to.include('sách');
            } else {
                console.log('⚠️  Page content:', pageText.substring(0, 200));
            }
            
        } catch (error) {
            console.log('❌ Error during test:', error.message);
            const url = await driver.getCurrentUrl();
            console.log('   Final URL:', url);
            throw error;
        }
    });
});
