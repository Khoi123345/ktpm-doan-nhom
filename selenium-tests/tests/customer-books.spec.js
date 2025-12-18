import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';

describe('Book Browsing & Search Tests', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    describe('Book List Page', function() {
        it('should display list of books', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Chờ books load
            const books = await waitForElements(driver, By.css('.book-card, [data-testid="book-item"]'), 5000);
            expect(books.length).to.be.greaterThan(0);
        });

        it('should filter books by category', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Click category filter
            const categoryFilter = await waitForElement(driver, By.css('select[name="category"], .category-filter'));
            await categoryFilter.click();
            
            // Chọn category đầu tiên
            const firstOption = await driver.findElement(By.css('option:nth-child(2)'));
            await firstOption.click();
            
            await driver.sleep(1000); // Chờ filter
            
            // Kiểm tra có books
            const books = await driver.findElements(By.css('.book-card, [data-testid="book-item"]'));
            expect(books.length).to.be.greaterThan(0);
        });

        it('should search books by title', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Tìm search box
            const searchBox = await waitForElement(driver, By.css('input[type="search"], input[name="search"], input[placeholder*="Search"]'));
            await searchBox.clear();
            await searchBox.sendKeys('book');
            
            await driver.sleep(1000); // Chờ search
            
            // Kiểm tra results
            const results = await driver.findElements(By.css('.book-card, [data-testid="book-item"]'));
            expect(results.length).to.be.greaterThan(0);
        });

        it('should sort books by price', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Click sort dropdown
            const sortSelect = await waitForElement(driver, By.css('select[name="sort"], .sort-select'));
            await sortSelect.click();
            
            // Chọn price ascending
            const priceOption = await driver.findElement(By.css('option[value*="price"]'));
            await priceOption.click();
            
            await driver.sleep(1000);
            
            // Verify books still displayed
            const books = await driver.findElements(By.css('.book-card'));
            expect(books.length).to.be.greaterThan(0);
        });
    });

    describe('Book Detail Page', function() {
        it('should display book details', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Click vào book đầu tiên
            const firstBook = await waitForElement(driver, By.css('.book-card, [data-testid="book-item"]'));
            await firstBook.click();
            
            await driver.sleep(1000);
            
            // Kiểm tra detail page elements
            const bookTitle = await waitForElement(driver, By.css('h1, .book-title'));
            expect(await bookTitle.getText()).to.not.be.empty;
            
            const bookPrice = await waitForElement(driver, By.css('.price, [data-testid="book-price"]'));
            expect(await bookPrice.getText()).to.not.be.empty;
        });

        it('should show book description', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            const firstBook = await waitForElement(driver, By.css('.book-card'));
            await firstBook.click();
            
            await driver.sleep(1000);
            
            const description = await waitForElement(driver, By.css('.description, .book-description, p'));
            expect(await description.getText()).to.not.be.empty;
        });

        it('should display book reviews', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            const firstBook = await waitForElement(driver, By.css('.book-card'));
            await firstBook.click();
            
            await driver.sleep(1000);
            
            // Scroll down để thấy reviews
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
            await driver.sleep(500);
            
            // Kiểm tra review section exists
            const reviewSection = await driver.findElements(By.css('.reviews, [data-testid="reviews"], .review-section'));
            expect(reviewSection.length).to.be.greaterThan(0);
        });
    });
});
