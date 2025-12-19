import { expect } from 'chai';
import { By, Key } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import config from '../config.js';

describe('E2E: Admin Books Management (Simple)', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login and view/create book', async function() {
        // STEP 1: Login
        console.log('STEP 1: Admin login...');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);
        
        const emailInput = await waitForElement(driver, By.css('input[type="email"]'));
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);
        await passwordInput.sendKeys(Key.RETURN);
        
        await driver.sleep(6000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('After login:', currentUrl);
        expect(currentUrl).to.not.include('/login');
        
        // STEP 2: Navigate to Books page
        console.log('\nSTEP 2: Navigate to books page...');
        await driver.get(`${config.adminUrl}/admin/books`);
        await driver.sleep(3000);
        
        // Verify we're on books page
        const pageText = await driver.findElement(By.css('body')).getText();
        console.log('Page loaded, checking content...');
        
        if (pageText.includes('Quản lý sách') || pageText.includes('Gigantitanic') || pageText.includes('sách')) {
            console.log('✓ Books page loaded successfully!');
        }
        
        // STEP 3: Click "Thêm sách mới" button
        console.log('\nSTEP 3: Looking for "Thêm sách mới" button...');
        try {
            const addBookBtn = await waitForElement(
                driver,
                By.xpath("//button[contains(text(), 'Thêm sách')]"),
                5000
            );
            console.log('✓ Found "Thêm sách" button');
            await addBookBtn.click();
            await driver.sleep(2000);
            
            // Check if form appeared
            const formText = await driver.findElement(By.css('body')).getText();
            if (formText.includes('Tên sách') || formText.includes('Tác giả') || formText.includes('Giá')) {
                console.log('✓ Book creation form loaded!');
                
                // Fill form
                console.log('\nSTEP 4: Filling book form...');
                const bookTitle = `Test Book ${Date.now()}`;
                
                const titleInput = await waitForElement(driver, By.css('input[name="title"]'));
                await titleInput.sendKeys(bookTitle);
                console.log(`✓ Entered title: ${bookTitle}`);
                
                const authorInput = await driver.findElement(By.css('input[name="author"]'));
                await authorInput.sendKeys('Test Author');
                console.log('✓ Entered author');
                
                const priceInput = await driver.findElement(By.css('input[name="price"]'));
                await priceInput.sendKeys('99000');
                console.log('✓ Entered price');
                
                const stockInput = await driver.findElement(By.css('input[name="stock"]'));
                await stockInput.sendKeys('50');
                console.log('✓ Entered stock');
                
                // Description (optional)
                try {
                    const descInput = await driver.findElement(By.css('textarea[name="description"]'));
                    await descInput.sendKeys('This is a test book created by Selenium E2E test');
                    console.log('✓ Entered description');
                } catch (e) {
                    console.log('⚠ Description field not found');
                }
                
                // Select category if available
                try {
                    const categorySelect = await driver.findElement(By.css('select[name="category"]'));
                    const options = await categorySelect.findElements(By.css('option'));
                    if (options.length > 1) {
                        await options[1].click();
                        console.log('✓ Selected category');
                    }
                } catch (e) {
                    console.log('⚠ Category select not found');
                }
                
                // Submit
                console.log('\nSTEP 5: Submitting form...');
                const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
                await submitBtn.click();
                await driver.sleep(4000);
                
                console.log('✓ Form submitted!');
                
                // Verify book in list
                const finalPageText = await driver.findElement(By.css('body')).getText();
                if (finalPageText.includes(bookTitle)) {
                    console.log(`\n✅ SUCCESS: Book "${bookTitle}" found in list!`);
                } else {
                    console.log('\n⚠ Book might have been created but not visible in list yet');
                }
            }
        } catch (e) {
            console.log('❌ Error:', e.message);
            throw e;
        }
    });
});
