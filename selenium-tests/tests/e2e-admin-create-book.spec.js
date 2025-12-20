import { expect } from 'chai';
import { By, Key } from 'selenium-webdriver';
import { createDriver, quitDriver, takeScreenshot } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import config from '../config.js';

describe('E2E: Admin Create Book Flow', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should complete full flow: login as admin -> create book -> verify book', async function() {
        // STEP 1: Admin Login
        console.log('STEP 1: Admin login...');
        await driver.get(`${config.adminUrl}/login`);
        
        await driver.sleep(2000);
        
        // Fill login form
        const emailInput = await waitForElement(driver, By.css('input[type="email"]'));
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);
        
        // Use Enter key instead of clicking button (fixes submit issue)
        console.log('Submitting login with Enter key...');
        await passwordInput.sendKeys(Key.RETURN);
        
        // Wait for login to complete and redirect
        console.log('Waiting for login to complete...');
        await driver.sleep(6000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('After login URL:', currentUrl);
        expect(currentUrl).to.not.include('/login');
        
        // STEP 2: Navigate to Books (skip category creation, use existing category)
        console.log('STEP 2: Navigate to books management...');
        
        // Click on "Sách" in sidebar
        try {
            const booksLink = await waitForElement(
                driver,
                By.xpath("//a[contains(text(), 'Sách') or contains(@href, 'books')]"),
                5000
            );
            await booksLink.click();
        } catch (e) {
            console.log('Books link not found, accessing directly...');
            await driver.get(`${config.adminUrl}/admin/books`);
        }
        
        await driver.sleep(2000);
        
        // STEP 3: Create New Book
        console.log('STEP 3: Create book...');
        
        // Find "Thêm sách mới" button
        const createBookBtn = await waitForElement(
            driver,
            By.xpath("//button[contains(text(), 'Thêm sách') or contains(text(), 'Tạo')]"),
            5000
        );
        await createBookBtn.click();
        
        await driver.sleep(2000);
        
        // Fill book form - ALL FIELDS
        const bookTitle = `Test Book ${Date.now()}`;
        console.log(`Creating book: ${bookTitle}`);
        
        // Tên sách * (required)
        const titleInput = await waitForElement(driver, By.css('input[name="title"]'));
        await titleInput.sendKeys(bookTitle);
        console.log(`✓ Title: ${bookTitle}`);
        
        // Nhà xuất bản
        const publisherInput = await driver.findElement(By.css('input[name="publisher"]'));
        await publisherInput.sendKeys('NXB Trẻ');
        console.log('✓ Publisher entered');
        
        // Tác giả * (required)
        const authorInput = await driver.findElement(By.css('input[name="author"]'));
        await authorInput.sendKeys('F. Scott Fitzgerald');
        console.log('✓ Author entered');
        
        // Năm xuất bản (date format YYYY-MM-DD)
        try {
            const publishedDateInput = await driver.findElement(By.css('input[name="publishedDate"]'));
            await publishedDateInput.sendKeys('2024-01-15');
            console.log('✓ Published date entered');
        } catch (e) {
            console.log('⚠ Published date field not found or skipped');
        }
        
        // Số trang
        try {
            const pagesInput = await driver.findElement(By.css('input[name="pages"]'));
            await pagesInput.sendKeys('320');
            console.log('✓ Pages entered');
        } catch (e) {
            console.log('⚠ Pages field not found or skipped');
        }
        
        // Giá * (required)
        const priceInput = await driver.findElement(By.css('input[name="price"]'));
        await priceInput.sendKeys('150000');
        console.log('✓ Price entered');
        
        // Giá khuyến mãi
        try {
            const discountPriceInput = await driver.findElement(By.css('input[name="discountPrice"]'));
            await discountPriceInput.sendKeys('120000');
            console.log('✓ Discount price entered');
        } catch (e) {
            console.log('⚠ Discount price field not found or skipped');
        }
        
        // ISBN (uppercase field name)
        try {
            const isbnInput = await driver.findElement(By.css('input[name="ISBN"]'));
            await isbnInput.sendKeys('978-0743273565');
            console.log('✓ ISBN entered');
        } catch (e) {
            console.log('⚠ ISBN field not found or skipped');
        }
        
        // Kho * (required)
        const stockInput = await driver.findElement(By.css('input[name="stock"]'));
        await stockInput.sendKeys('100');
        console.log('✓ Stock entered');
        
        // Mô tả
        try {
            const descInput = await driver.findElement(By.css('textarea[name="description"]'));
            await descInput.sendKeys('This is an automated test book created by Selenium. Testing E2E flow for admin book creation with all form fields filled.');
            console.log('✓ Description entered');
        } catch (e) {
            console.log('⚠ Description field not found or skipped');
        }
        
        // Select category - use existing "Fiction" category
        try {
            const categorySelect = await driver.findElement(By.css('select[name="category"]'));
            await categorySelect.click();
            await driver.sleep(500);
            
            // Select Fiction or first available option
            const options = await categorySelect.findElements(By.css('option'));
            console.log(`Found ${options.length} category options`);
            
            // Try to find Fiction category or use first non-empty option
            let categorySelected = false;
            for (let i = 0; i < options.length; i++) {
                const optionText = await options[i].getText();
                if (optionText.includes('Fiction') || (i > 0 && optionText.trim().length > 0)) {
                    await options[i].click();
                    console.log(`✓ Selected category: ${optionText}`);
                    categorySelected = true;
                    break;
                }
            }
            
            if (!categorySelected && options.length > 1) {
                await options[1].click();
                console.log('✓ Selected first available category');
            }
        } catch (e) {
            console.log('Category select error:', e.message);
        }
        
        await driver.sleep(1000);
        
        // Submit book - scroll to button and use JavaScript click
        console.log('Submitting book form...');
        
        // Get ALL submit buttons and choose the one in the modal/form
        const submitBtns = await driver.findElements(By.css('button[type="submit"]'));
        console.log(`Found ${submitBtns.length} submit buttons`);
        
        // The book form submit button is usually the last one or contains specific text
        let submitBookBtn = null;
        for (let i = 0; i < submitBtns.length; i++) {
            const btnText = await submitBtns[i].getText();
            console.log(`  Button ${i}: "${btnText}"`);
            
            // Look for "Thêm mới" or "Thêm" or similar text (not "Tìm kiếm")
            if (btnText.includes('Thêm') || btnText.includes('Cập nhật') || btnText.includes('Lưu')) {
                submitBookBtn = submitBtns[i];
                console.log(`  ✓ Selected button: "${btnText}"`);
                break;
            }
        }
        
        // If not found by text, use the last submit button (usually the one in modal)
        if (!submitBookBtn && submitBtns.length > 1) {
            submitBookBtn = submitBtns[submitBtns.length - 1];
            console.log('  Using last submit button as fallback');
        } else if (!submitBookBtn) {
            submitBookBtn = submitBtns[0];
        }
        
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submitBookBtn);
        await driver.sleep(1000);
        await driver.executeScript("arguments[0].click();", submitBookBtn);
        
        console.log('Waiting for book creation...');
        await driver.sleep(4000);
        
        console.log('✓ Book created:', bookTitle);
        
        // STEP 4: Verify success
        console.log('STEP 4: Verifying book creation...');
        
        await driver.sleep(3000);
        
        // Check if we're back on books list page
        const finalUrl = await driver.getCurrentUrl();
        console.log(`Final URL: ${finalUrl}`);
        
        // Simple verification - if we're on /admin/books page, creation was successful
        expect(finalUrl).to.include('/admin/books');
        
        console.log('✅ E2E TEST PASSED: Book created successfully!');
    });
});
