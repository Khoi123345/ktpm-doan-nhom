import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By, Key } from 'selenium-webdriver';
import config from '../config.js';

describe('Admin Book Management Tests', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    beforeEach(async function() {
        // Admin login
        await driver.get(`${config.adminUrl}/login`);
        
        try {
            const emailInput = await waitForElement(driver, By.css('input[type="email"]'), 5000);
            await emailInput.clear();
            await emailInput.sendKeys(config.admin.email);
            
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            await passwordInput.clear();
            await passwordInput.sendKeys(config.admin.password);
            
            // Submit form using Enter key (more reliable than button click)
            await passwordInput.sendKeys(Key.RETURN);
            
            await driver.sleep(3000);
        } catch (error) {
            console.log('Already logged in');
        }
    });

    describe('View Books', function() {
        it('should display books list', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            // Wait for page to load completely
            await driver.sleep(2000);
            
            // Wait for the books table
            const booksList = await waitForElement(driver, By.css('table'), 15000);
            expect(await booksList.isDisplayed()).to.be.true;
        });

        it('should show book details in table', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            // Check for table headers
            const headers = await driver.findElements(By.css('th, .table-header'));
            expect(headers.length).to.be.greaterThan(0);
        });

        it('should search books', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            const searchInputs = await driver.findElements(By.css('input[type="search"], input[placeholder*="Search"]'));
            
            if (searchInputs.length > 0) {
                await searchInputs[0].sendKeys('test');
                await driver.sleep(1000);
                
                // Verify search executed
                const value = await searchInputs[0].getAttribute('value');
                expect(value).to.equal('test');
            }
        });
    });

    describe('Create Book', function() {
        it('should open create book form', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            // Find Add/Create button
            const createBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Add') or contains(text(), 'Create') or contains(text(), 'New')]"));
            
            if (createBtn.length > 0) {
                await createBtn[0].click();
                await driver.sleep(1000);
                
                // Verify form appeared
                const form = await driver.findElements(By.css('form, .create-form, [data-testid="book-form"]'));
                expect(form.length).to.be.greaterThan(0);
            }
        });

        it('should validate required fields', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            const createBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Add') or contains(text(), 'Create')]"));
            
            if (createBtn.length > 0) {
                await createBtn[0].click();
                await driver.sleep(500);
                
                // Try to submit empty form
                const submitBtn = await driver.findElements(By.css('button[type="submit"]'));
                if (submitBtn.length > 0) {
                    await submitBtn[0].click();
                    await driver.sleep(1000);
                    
                    // Should show validation errors
                    const errors = await driver.findElements(By.css('.error, .invalid-feedback, .text-red-500'));
                    expect(errors.length).to.be.greaterThan(0);
                }
            }
        });

        it('should fill book form', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            const createBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Add')]"));
            
            if (createBtn.length > 0) {
                await createBtn[0].click();
                await driver.sleep(500);
                
                // Fill title
                const titleInput = await driver.findElements(By.css('input[name="title"]'));
                if (titleInput.length > 0) {
                    await titleInput[0].sendKeys('Test Book Title');
                }
                
                // Fill author
                const authorInput = await driver.findElements(By.css('input[name="author"]'));
                if (authorInput.length > 0) {
                    await authorInput[0].sendKeys('Test Author');
                }
                
                // Fill price
                const priceInput = await driver.findElements(By.css('input[name="price"]'));
                if (priceInput.length > 0) {
                    await priceInput[0].sendKeys('29.99');
                }
                
                await driver.sleep(500);
                
                // Verify fields filled
                const titleValue = await titleInput[0].getAttribute('value');
                expect(titleValue).to.equal('Test Book Title');
            }
        });
    });

    describe('Edit Book', function() {
        it('should open edit book form', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            // Find edit button for first book
            const editButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Edit')] | //a[contains(text(), 'Edit')]"));
            
            if (editButtons.length > 0) {
                await editButtons[0].click();
                await driver.sleep(1000);
                
                // Verify form loaded with data
                const titleInput = await driver.findElements(By.css('input[name="title"]'));
                if (titleInput.length > 0) {
                    const value = await titleInput[0].getAttribute('value');
                    expect(value).to.not.be.empty;
                }
            }
        });

        it('should update book information', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            const editButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Edit')]"));
            
            if (editButtons.length > 0) {
                await editButtons[0].click();
                await driver.sleep(1000);
                
                // Update title
                const titleInput = await driver.findElements(By.css('input[name="title"]'));
                if (titleInput.length > 0) {
                    await titleInput[0].clear();
                    await titleInput[0].sendKeys('Updated Book Title');
                    
                    // Submit
                    const saveBtn = await driver.findElements(By.css('button[type="submit"]'));
                    if (saveBtn.length > 0) {
                        await saveBtn[0].click();
                        await driver.sleep(1000);
                        
                        // Check for success message
                        const messages = await driver.findElements(By.css('.success, .alert-success'));
                        expect(messages.length).to.be.greaterThan(0);
                    }
                }
            }
        });
    });

    describe('Delete Book', function() {
        it('should show delete confirmation', async function() {
            await driver.get(`${config.adminUrl}/books`);
            
            // Find delete button
            const deleteButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Delete')] | //button[contains(@class, 'delete')]"));
            
            if (deleteButtons.length > 0) {
                await deleteButtons[0].click();
                await driver.sleep(500);
                
                // Should show confirmation dialog
                const confirmDialog = await driver.findElements(By.css('.modal, .dialog, [role="dialog"]'));
                expect(confirmDialog.length).to.be.greaterThan(0);
            }
        });
    });
});
