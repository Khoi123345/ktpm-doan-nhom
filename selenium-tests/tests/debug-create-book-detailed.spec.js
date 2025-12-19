import { expect } from 'chai';
import { By, Key, until } from 'selenium-webdriver';
import { createDriver, quitDriver, takeScreenshot } from '../helpers/driver-manager.js';
import config from '../config.js';
import fs from 'fs';

describe('DEBUG: Create Book Form Analysis', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should analyze book creation form and capture all states', async function() {
        console.log('\n=== DEBUGGING BOOK CREATION ===\n');
        
        // Login
        console.log('1. Logging in...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);
        
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.sendKeys('admin@bookstore.com');
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys('Admin@123456');
        await passwordInput.sendKeys(Key.RETURN);
        
        await driver.sleep(6000);
        console.log('✓ Logged in\n');
        
        // Navigate to books
        console.log('2. Going to books page...');
        await driver.get(`${config.adminUrl}/admin/books`);
        await driver.sleep(3000);
        console.log('✓ On books page\n');
        
        // Click create
        console.log('3. Opening create form...');
        const createBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Thêm sách')]"));
        await createBtn.click();
        await driver.sleep(2000);
        console.log('✓ Form opened\n');
        
        // Take screenshot of empty form
        await takeScreenshot(driver, 'empty-form');
        
        // Analyze form structure
        console.log('4. Analyzing form structure...');
        
        // Get all input fields
        const inputs = await driver.findElements(By.css('input[type="text"], input[type="number"], input[type="date"]'));
        console.log(`   Found ${inputs.length} input fields`);
        
        // Get their names
        for (let i = 0; i < inputs.length; i++) {
            const name = await inputs[i].getAttribute('name');
            const required = await inputs[i].getAttribute('required');
            const placeholder = await inputs[i].getAttribute('placeholder');
            console.log(`   - Input[${i}]: name="${name}", required="${required}", placeholder="${placeholder}"`);
        }
        
        // Check textareas
        const textareas = await driver.findElements(By.css('textarea'));
        console.log(`\n   Found ${textareas.length} textarea fields`);
        for (let i = 0; i < textareas.length; i++) {
            const name = await textareas[i].getAttribute('name');
            const required = await textareas[i].getAttribute('required');
            console.log(`   - Textarea[${i}]: name="${name}", required="${required}"`);
        }
        
        // Check selects
        const selects = await driver.findElements(By.css('select'));
        console.log(`\n   Found ${selects.length} select fields`);
        for (let i = 0; i < selects.length; i++) {
            const name = await selects[i].getAttribute('name');
            const required = await selects[i].getAttribute('required');
            console.log(`   - Select[${i}]: name="${name}", required="${required}"`);
        }
        
        console.log('\n5. Filling form with EXACT manual values...');
        
        // Fill title
        const titleInput = await driver.findElement(By.css('input[name="title"]'));
        await titleInput.clear();
        await titleInput.sendKeys('Manual Test Book');
        console.log('   ✓ Title filled');
        
        // Fill author
        const authorInput = await driver.findElement(By.css('input[name="author"]'));
        await authorInput.clear();
        await authorInput.sendKeys('Manual Author');
        console.log('   ✓ Author filled');
        
        // Fill description
        const descInput = await driver.findElement(By.css('textarea[name="description"]'));
        await descInput.clear();
        await descInput.sendKeys('This is a manual test description');
        console.log('   ✓ Description filled');
        
        // Fill price
        const priceInput = await driver.findElement(By.css('input[name="price"]'));
        await priceInput.clear();
        await priceInput.sendKeys('100000');
        console.log('   ✓ Price filled');
        
        // Fill stock
        const stockInput = await driver.findElement(By.css('input[name="stock"]'));
        await stockInput.clear();
        await stockInput.sendKeys('50');
        console.log('   ✓ Stock filled');
        
        // Select category
        const categorySelect = await driver.findElement(By.css('select[name="category"]'));
        const options = await categorySelect.findElements(By.css('option'));
        if (options.length > 1) {
            await options[1].click();
            const selectedText = await options[1].getText();
            console.log(`   ✓ Category selected: ${selectedText}`);
        }
        
        await driver.sleep(1000);
        
        // Take screenshot after filling
        await takeScreenshot(driver, 'filled-form');
        
        // Check form validity before submit
        console.log('\n6. Checking form state before submit...');
        
        // Check if any validation errors
        const errorElements = await driver.findElements(By.css('.error, .text-red-500, .text-danger, [class*="error"]'));
        console.log(`   Validation errors: ${errorElements.length}`);
        
        if (errorElements.length > 0) {
            console.log('   ERROR MESSAGES FOUND:');
            for (let i = 0; i < errorElements.length; i++) {
                const text = await errorElements[i].getText();
                if (text.trim().length > 0) {
                    console.log(`   - ${text}`);
                }
            }
        }
        
        // Get page HTML
        const pageSource = await driver.getPageSource();
        
        // Check for required pattern
        const requiredFields = (pageSource.match(/required/gi) || []).length;
        console.log(`   Required attributes in HTML: ${requiredFields}`);
        
        // Find submit button
        console.log('\n7. Analyzing submit button...');
        const submitBtns = await driver.findElements(By.css('button[type="submit"]'));
        console.log(`   Found ${submitBtns.length} submit button(s)`);
        
        if (submitBtns.length > 0) {
            const submitBtn = submitBtns[0];
            const isEnabled = await submitBtn.isEnabled();
            const isDisplayed = await submitBtn.isDisplayed();
            const buttonText = await submitBtn.getText();
            const buttonClass = await submitBtn.getAttribute('class');
            
            console.log(`   - Text: "${buttonText}"`);
            console.log(`   - Enabled: ${isEnabled}`);
            console.log(`   - Displayed: ${isDisplayed}`);
            console.log(`   - Classes: ${buttonClass}`);
            
            // Try to get button position
            try {
                const rect = await driver.executeScript("return arguments[0].getBoundingClientRect();", submitBtn);
                console.log(`   - Position: top=${rect.top}, left=${rect.left}, bottom=${rect.bottom}`);
                console.log(`   - Size: width=${rect.width}, height=${rect.height}`);
            } catch (e) {
                console.log('   - Could not get button position');
            }
            
            // Scroll to button
            console.log('\n8. Attempting to submit...');
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
            await driver.sleep(1000);
            
            // Take screenshot before submit
            await takeScreenshot(driver, 'before-submit');
            
            // Try clicking
            console.log('   Clicking submit button...');
            try {
                await driver.executeScript("arguments[0].click();", submitBtn);
                console.log('   ✓ Button clicked');
            } catch (e) {
                console.log(`   ✗ Click failed: ${e.message}`);
            }
            
            // Wait and check what happened
            console.log('\n9. Checking result...');
            await driver.sleep(5000);
            
            const newUrl = await driver.getCurrentUrl();
            console.log(`   Current URL: ${newUrl}`);
            
            // Take screenshot after submit
            await takeScreenshot(driver, 'after-submit');
            
            // Check for success/error messages
            const bodyText = await driver.findElement(By.css('body')).getText();
            
            if (bodyText.includes('thành công') || bodyText.includes('success')) {
                console.log('   ✅ SUCCESS message found!');
            } else if (bodyText.includes('lỗi') || bodyText.includes('error') || bodyText.includes('bắt buộc')) {
                console.log('   ❌ ERROR message found!');
                console.log('   Page content (first 500 chars):');
                console.log(bodyText.substring(0, 500));
            } else if (newUrl.includes('/admin/books') && !newUrl.includes('create')) {
                console.log('   ✅ Redirected to books list - likely successful!');
            } else {
                console.log('   ⚠️ Unclear result');
                console.log('   Page content (first 300 chars):');
                console.log(bodyText.substring(0, 300));
            }
            
            // Get console logs
            try {
                const logs = await driver.manage().logs().get('browser');
                if (logs.length > 0) {
                    console.log('\n10. Browser console logs:');
                    logs.forEach(log => {
                        if (log.level.name === 'SEVERE' || log.message.includes('error') || log.message.includes('Error')) {
                            console.log(`   [${log.level.name}] ${log.message}`);
                        }
                    });
                }
            } catch (e) {
                console.log('   Could not fetch browser logs');
            }
        }
        
        console.log('\n=== DEBUG COMPLETE ===\n');
    });
});
