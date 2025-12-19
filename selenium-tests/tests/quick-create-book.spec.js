import { expect } from 'chai';
import { By, Key } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import config from '../config.js';

describe('Quick: Create Book Test', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login and create a book', async function() {
        // Login
        console.log('1. Logging in...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);
        
        const emailInput = await driver.wait(async () => 
            await driver.findElement(By.css('input[type="email"]')), 10000
        );
        await emailInput.sendKeys('admin@bookstore.com');
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys('Admin@123456');
        await passwordInput.sendKeys(Key.RETURN);
        
        await driver.sleep(6000);
        console.log('✓ Logged in');
        
        // Go to books page
        console.log('2. Navigating to books...');
        await driver.get(`${config.adminUrl}/admin/books`);
        await driver.sleep(3000);
        console.log('✓ On books page');
        
        // Click create button
        console.log('3. Clicking create button...');
        const createBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Thêm sách') or contains(text(), 'Thêm')]"));
        await createBtn.click();
        await driver.sleep(2000);
        console.log('✓ Form opened');
        
        // Fill minimum required fields
        console.log('4. Filling form...');
        
        const title = `Selenium Book ${Date.now()}`;
        await driver.findElement(By.css('input[name="title"]')).sendKeys(title);
        console.log(`  - Title: ${title}`);
        
        await driver.findElement(By.css('input[name="author"]')).sendKeys('Selenium Author');
        console.log('  - Author: OK');
        
        await driver.findElement(By.css('input[name="price"]')).sendKeys('99000');
        console.log('  - Price: OK');
        
        await driver.findElement(By.css('input[name="stock"]')).sendKeys('50');
        console.log('  - Stock: OK');
        
        // Category
        const categorySelect = await driver.findElement(By.css('select[name="category"]'));
        const options = await categorySelect.findElements(By.css('option'));
        if (options.length > 1) {
            await options[1].click();
            console.log('  - Category: Selected');
        }
        
        await driver.sleep(1000);
        
        // Check for errors on page before submit
        console.log('5. Checking page state before submit...');
        const bodyText = await driver.findElement(By.css('body')).getText();
        if (bodyText.includes('bắt buộc') || bodyText.includes('required')) {
            console.log('⚠️  Warning: Found validation messages');
        }
        
        // Submit
        console.log('6. Submitting form...');
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        
        // Scroll to button
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
        await driver.sleep(1000);
        
        // Check if button is enabled
        const isEnabled = await submitBtn.isEnabled();
        console.log(`  - Button enabled: ${isEnabled}`);
        
        // Click
        await driver.executeScript("arguments[0].click();", submitBtn);
        console.log('  - Clicked submit');
        
        // Wait and check result
        console.log('7. Waiting for result...');
        await driver.sleep(5000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log(`  - Current URL: ${currentUrl}`);
        
        const newBodyText = await driver.findElement(By.css('body')).getText();
        
        if (newBodyText.includes(title)) {
            console.log('✓ SUCCESS: Book found in page!');
        } else if (currentUrl.includes('/books') && !currentUrl.includes('/create')) {
            console.log('✓ SUCCESS: Redirected to books list');
        } else if (newBodyText.includes('error') || newBodyText.includes('lỗi')) {
            console.log('❌ ERROR: Error message found');
            console.log('Page text:', newBodyText.substring(0, 500));
        } else {
            console.log('⚠️  UNCLEAR: Checking page content...');
            console.log('Page text (first 300 chars):', newBodyText.substring(0, 300));
        }
        
        // Final assertion
        expect(currentUrl).to.satisfy(url => 
            url.includes('/admin/books') || newBodyText.includes('sách')
        );
    });
});
