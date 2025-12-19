import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('DEBUG: Simple Admin Login', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login to admin panel and check response', async function() {
        console.log('=== DEBUG LOGIN TEST ===');
        console.log('Config:', config);
        
        // Navigate to admin login
        console.log(`\n1. Navigating to ${config.adminUrl}/login`);
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(3000);
        
        // Take screenshot
        const screenshot1 = await driver.takeScreenshot();
        console.log('Screenshot 1 taken');
        
        // Log page source
        const pageSource = await driver.getPageSource();
        console.log('\n2. Page source length:', pageSource.length);
        
        // Find email input
        console.log('\n3. Looking for email input...');
        const emailInput = await driver.wait(
            until.elementLocated(By.css('input[type="email"]')),
            10000,
            'Email input not found'
        );
        console.log('✓ Email input found');
        await emailInput.sendKeys(config.admin.email);
        console.log(`✓ Entered email: ${config.admin.email}`);
        
        // Find password input
        console.log('\n4. Looking for password input...');
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        console.log('✓ Password input found');
        await passwordInput.sendKeys(config.admin.password);
        console.log(`✓ Entered password: ${config.admin.password}`);
        
        await driver.sleep(1000);
        
        // Find and click submit button
        console.log('\n5. Looking for submit button...');
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        console.log('✓ Submit button found');
        
        // Get button text
        const buttonText = await submitButton.getText();
        console.log(`Button text: "${buttonText}"`);
        
        // Click login
        console.log('\n6. Clicking login button...');
        await submitButton.click();
        console.log('✓ Button clicked');
        
        // Wait a bit for response
        await driver.sleep(5000);
        
        // Check URL after login
        const currentUrl = await driver.getCurrentUrl();
        console.log(`\n7. Current URL after login: ${currentUrl}`);
        
        // Check for error messages
        try {
            const bodyText = await driver.findElement(By.css('body')).getText();
            console.log('\n8. Page body text (first 500 chars):');
            console.log(bodyText.substring(0, 500));
            
            if (bodyText.includes('error') || bodyText.includes('invalid') || bodyText.includes('incorrect')) {
                console.log('\n⚠️  Page contains error text!');
            }
        } catch (e) {
            console.log('Could not get body text:', e.message);
        }
        
        // Take final screenshot
        const screenshot2 = await driver.takeScreenshot();
        console.log('\n9. Final screenshot taken');
        
        // Check if we're still on login page
        if (currentUrl.includes('/login')) {
            console.log('\n❌ Still on login page - login failed!');
            console.log('This usually means:');
            console.log('- Wrong credentials');
            console.log('- Backend not receiving request');
            console.log('- Frontend API proxy not working');
        } else {
            console.log('\n✅ Login successful - redirected!');
        }
        
        // Assert for test framework
        expect(currentUrl).to.not.include('/login');
    });
});
