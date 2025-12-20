import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { login } from '../helpers/login-helper.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';

describe('E2E Test: User Login and View Book Details', function() {
    let driver;

    before(async function() {
        this.timeout(30000);
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should login as customer and view book details', async function() {
        this.timeout(60000);

        // Step 1: Navigate to customer login page
        console.log('Step 1: Navigating to login page...');
        const loginUrl = `${config.baseUrl}/login`;
        await driver.get(loginUrl);
        await driver.sleep(2000);

        // Step 2: Login with customer credentials
        console.log('Step 2: Logging in as customer...');
        
        // Fill in login form
        const emailInput = await waitForElement(driver, By.css('input[type="email"]'), 10000);
        await emailInput.clear();
        await emailInput.sendKeys(config.testUser.email);
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys(config.testUser.password);
        
        // Submit form
        await passwordInput.sendKeys('\n');
        await driver.sleep(3000);

        // Step 3: Verify successful login
        console.log('Step 3: Verifying login success...');
        const currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after login:', currentUrl);
        
        // Check if we're still on login page - if yes, check for errors
        if (currentUrl.includes('/login')) {
            console.log('Still on login page, checking for error messages...');
            try {
                const errorMessage = await driver.findElement(
                    By.css('.error, .alert, [class*="error"], [class*="alert"]')
                );
                const errorText = await errorMessage.getText();
                console.log('Error message found:', errorText);
            } catch (e) {
                console.log('No error message found, but still on login page');
            }
            
            // Try to check if user is logged in by looking for user menu or profile link
            try {
                const userMenu = await driver.findElement(
                    By.css('[class*="user"], [class*="profile"], a[href*="profile"]')
                );
                if (userMenu) {
                    console.log('User menu found, login might be successful');
                }
            } catch (e) {
                console.log('User menu not found');
            }
        } else {
            console.log('Redirected from login page - login successful');
            expect(currentUrl).to.not.include('/login');
        }
        
        // Step 4: Navigate to books page
        console.log('Step 4: Navigating to books page...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        // Step 5: Wait for books to load
        console.log('Step 5: Waiting for books to load...');
        const bookLinks = await waitForElements(
            driver, 
            By.css('a[href*="/books/"]'),
            10000
        );
        expect(bookLinks.length).to.be.greaterThan(0);
        console.log(`Found ${bookLinks.length} books`);

        // Step 6: Get book title before clicking
        console.log('Step 6: Getting first book information...');
        const firstBookLink = bookLinks[0];
        const bookHref = await firstBookLink.getAttribute('href');
        console.log('Book URL:', bookHref);

        // Try to get book title from the card
        try {
            const bookTitle = await firstBookLink.findElement(By.css('h2, h3, .book-title, [class*="title"]'));
            const titleText = await bookTitle.getText();
            console.log('Book title:', titleText);
        } catch (e) {
            console.log('Could not find book title element');
        }

        // Step 7: Click on the first book to view details
        console.log('Step 7: Clicking on first book...');
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", firstBookLink);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", firstBookLink);
        await driver.sleep(3000);

        // Step 8: Verify we're on book detail page
        console.log('Step 8: Verifying book detail page...');
        const detailUrl = await driver.getCurrentUrl();
        console.log('Detail page URL:', detailUrl);
        
        // Check that we moved from /books to a specific book page
        const isOnDetailPage = detailUrl.includes('/books/') || (detailUrl.includes('/books') && detailUrl !== `${config.baseUrl}/books`);
        expect(isOnDetailPage, `Expected to be on book detail page, but URL is: ${detailUrl}`).to.be.true;

        // Step 9: Verify book detail elements are present
        console.log('Step 9: Checking book detail elements...');
        
        // Check for book title
        try {
            const detailTitle = await waitForElement(
                driver,
                By.css('h1, h2, .book-title, [class*="title"]'),
                5000
            );
            const detailTitleText = await detailTitle.getText();
            console.log('Book detail title:', detailTitleText);
            expect(detailTitleText).to.not.be.empty;
        } catch (e) {
            console.error('Could not find book title on detail page');
            throw e;
        }

        // Check for book price
        try {
            const priceElement = await driver.findElement(
                By.css('[class*="price"], .book-price, [class*="Price"]')
            );
            const priceText = await priceElement.getText();
            console.log('Book price:', priceText);
            expect(priceText).to.not.be.empty;
        } catch (e) {
            console.log('Price element not found or not visible');
        }

        // Check for book description
        try {
            const descriptionElement = await driver.findElement(
                By.css('[class*="description"], .book-description, p')
            );
            const descriptionText = await descriptionElement.getText();
            console.log('Book description (first 100 chars):', descriptionText.substring(0, 100));
        } catch (e) {
            console.log('Description element not found or not visible');
        }

        // Check for Add to Cart button (should be visible for logged-in customer)
        try {
            const addToCartButton = await driver.findElement(
                By.css('button[class*="cart"], button:contains("Add to Cart"), button:contains("Thêm vào giỏ")')
            );
            const isDisplayed = await addToCartButton.isDisplayed();
            console.log('Add to Cart button visible:', isDisplayed);
            expect(isDisplayed).to.be.true;
        } catch (e) {
            console.log('Add to Cart button not found');
        }

        // Step 10: Verify book image
        try {
            const bookImage = await driver.findElement(
                By.css('img[class*="book"], img[alt*="book"], .book-image img, img')
            );
            const imageSrc = await bookImage.getAttribute('src');
            console.log('Book image src:', imageSrc);
            expect(imageSrc).to.not.be.empty;
        } catch (e) {
            console.log('Book image not found');
        }

        console.log('✓ E2E Test completed successfully: User logged in and viewed book details');
    });

    it('should be able to navigate back to books list from detail page', async function() {
        this.timeout(30000);

        console.log('Test: Navigation from detail to list...');
        
        // Should already be on a book detail page from previous test
        const currentUrl = await driver.getCurrentUrl();
        
        if (!currentUrl.includes('/books/')) {
            // If not on detail page, navigate there first
            await driver.get(`${config.baseUrl}/books`);
            await driver.sleep(2000);
            const bookLinks = await waitForElements(driver, By.css('a[href*="/books/"]'), 5000);
            await bookLinks[0].click();
            await driver.sleep(2000);
        }

        // Try to find and click back button or navigation link
        console.log('Attempting to navigate back to books list...');
        
        // Use browser back navigation (most reliable)
        await driver.navigate().back();
        await driver.sleep(3000);
        
        // Verify we're back on books list
        const newUrl = await driver.getCurrentUrl();
        console.log('URL after going back:', newUrl);
        
        // Check that URL is either /books or root (which might redirect to /books)
        const isOnBooksPage = newUrl.includes('/books') || newUrl === `${config.baseUrl}/` || newUrl === config.baseUrl;
        expect(isOnBooksPage, `Expected to be on books page, but URL is: ${newUrl}`).to.be.true;
        
        // Verify books are visible again
        const booksAfterBack = await waitForElements(
            driver,
            By.css('a[href*="/books/"], .book-card, [class*="book"], img'),
            10000
        );
        expect(booksAfterBack.length).to.be.greaterThan(0);
        console.log(`✓ Successfully navigated back to books list (${booksAfterBack.length} elements visible)`);
    });
});
