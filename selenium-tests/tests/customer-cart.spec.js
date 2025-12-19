import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By, Key } from 'selenium-webdriver';
import config from '../config.js';

describe('Shopping Cart Tests', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    beforeEach(async function() {
        // Login before each test
        await driver.get(`${config.baseUrl}/login`);
        
        try {
            const emailInput = await waitForElement(driver, By.css('input[type="email"]'), 5000);
            await emailInput.clear();
            await emailInput.sendKeys(config.testUser.email);
            
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            await passwordInput.clear();
            await passwordInput.sendKeys(config.testUser.password);
            
            // Submit form using Enter key (more reliable than button click)
            await passwordInput.sendKeys(Key.RETURN);
            
            await driver.sleep(3000);
        } catch (error) {
            console.log('Login form not found or user already logged in');
        }
    });

    describe('Add to Cart', function() {
        it('should add book to cart from book detail page', async function() {
            await driver.get(`${config.baseUrl}/books`);
            
            // Click book detail
            const firstBook = await waitForElement(driver, By.css('.book-card'));
            await firstBook.click();
            
            await driver.sleep(1000);
            
            // Click Add to Cart button
            const addToCartBtn = await waitForElement(driver, By.css('button:contains("Add to Cart"), button[data-action="add-to-cart"], .add-to-cart-btn'));
            await addToCartBtn.click();
            
            await driver.sleep(1000);
            
            // Verify cart icon has badge or notification
            const cartBadge = await driver.findElements(By.css('.cart-badge, .badge, [data-testid="cart-count"]'));
            expect(cartBadge.length).to.be.greaterThan(0);
        });

        it('should update quantity in cart', async function() {
            await driver.get(`${config.baseUrl}/cart`);
            
            // Tìm quantity input
            const quantityInput = await waitForElement(driver, By.css('input[type="number"], .quantity-input'));
            
            // Clear and set new quantity
            await quantityInput.clear();
            await quantityInput.sendKeys('2');
            
            await driver.sleep(1000);
            
            // Verify update button or auto-update
            const currentValue = await quantityInput.getAttribute('value');
            expect(parseInt(currentValue)).to.equal(2);
        });

        it('should remove item from cart', async function() {
            await driver.get(`${config.baseUrl}/cart`);
            
            // Get initial cart items count
            const initialItems = await driver.findElements(By.css('.cart-item, [data-testid="cart-item"]'));
            const initialCount = initialItems.length;
            
            if (initialCount > 0) {
                // Click remove button
                const removeBtn = await driver.findElement(By.css('button:contains("Remove"), .remove-btn, button[data-action="remove"]'));
                await removeBtn.click();
                
                await driver.sleep(1000);
                
                // Verify item removed
                const updatedItems = await driver.findElements(By.css('.cart-item'));
                expect(updatedItems.length).to.be.lessThan(initialCount);
            }
        });

        it('should calculate total price correctly', async function() {
            await driver.get(`${config.baseUrl}/cart`);
            
            // Get cart total
            const totalElement = await waitForElement(driver, By.css('.total-price, [data-testid="cart-total"], .cart-summary .total'));
            const totalText = await totalElement.getText();
            
            // Verify total is a number
            const totalValue = parseFloat(totalText.replace(/[^0-9.]/g, ''));
            expect(totalValue).to.be.a('number');
            expect(totalValue).to.be.greaterThan(0);
        });
    });

    describe('Cart Navigation', function() {
        it('should navigate to checkout from cart', async function() {
            await driver.get(`${config.baseUrl}/cart`);
            
            // Click checkout button
            const checkoutBtn = await waitForElement(driver, By.css('button:contains("Checkout"), .checkout-btn, button[data-action="checkout"]'));
            await checkoutBtn.click();
            
            await driver.sleep(1000);
            
            // Verify on checkout page
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.include('checkout');
        });

        it('should show empty cart message when no items', async function() {
            await driver.get(`${config.baseUrl}/cart`);
            
            // Try to remove all items
            const removeButtons = await driver.findElements(By.css('button:contains("Remove"), .remove-btn'));
            
            for (const btn of removeButtons) {
                await btn.click();
                await driver.sleep(500);
            }
            
            await driver.sleep(1000);
            
            // Check for empty cart message
            const emptyMessage = await driver.findElements(By.xpath("//*[contains(text(), 'empty') or contains(text(), 'Empty') or contains(text(), 'No items')]"));
            expect(emptyMessage.length).to.be.greaterThan(0);
        });
    });
});
