import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';

describe('Checkout & Order Tests', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    beforeEach(async function() {
        // Login
        await driver.get(`${config.baseUrl}/login`);
        
        try {
            const emailInput = await waitForElement(driver, By.css('input[type="email"]'), 5000);
            await emailInput.sendKeys(config.testUser.email);
            
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            await passwordInput.sendKeys(config.testUser.password);
            
            const submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            
            await driver.sleep(2000);
        } catch (error) {
            console.log('Already logged in');
        }
    });

    describe('Checkout Process', function() {
        it('should display checkout form', async function() {
            await driver.get(`${config.baseUrl}/checkout`);
            
            // Verify shipping address fields
            const addressInput = await waitForElement(driver, By.css('input[name="address"], textarea[name="address"]'));
            expect(await addressInput.isDisplayed()).to.be.true;
            
            const phoneInput = await driver.findElements(By.css('input[name="phone"]'));
            expect(phoneInput.length).to.be.greaterThan(0);
        });

        it('should validate required checkout fields', async function() {
            await driver.get(`${config.baseUrl}/checkout`);
            
            // Try submit without filling
            const submitBtn = await waitForElement(driver, By.css('button[type="submit"], .place-order-btn'));
            await submitBtn.click();
            
            await driver.sleep(1000);
            
            // Should show validation errors
            const errors = await driver.findElements(By.css('.error, .text-red-500, .invalid-feedback'));
            expect(errors.length).to.be.greaterThan(0);
        });

        it('should fill shipping information', async function() {
            await driver.get(`${config.baseUrl}/checkout`);
            
            // Fill address
            const addressInput = await waitForElement(driver, By.css('input[name="address"], textarea[name="address"]'));
            await addressInput.clear();
            await addressInput.sendKeys('123 Test Street, Test City');
            
            // Fill phone
            const phoneInputs = await driver.findElements(By.css('input[name="phone"]'));
            if (phoneInputs.length > 0) {
                await phoneInputs[0].clear();
                await phoneInputs[0].sendKeys('0123456789');
            }
            
            await driver.sleep(500);
            
            // Verify filled
            const addressValue = await addressInput.getAttribute('value');
            expect(addressValue).to.not.be.empty;
        });

        it('should select payment method', async function() {
            await driver.get(`${config.baseUrl}/checkout`);
            
            // Find payment method options
            const paymentOptions = await driver.findElements(By.css('input[type="radio"][name="paymentMethod"], .payment-option'));
            
            if (paymentOptions.length > 0) {
                await paymentOptions[0].click();
                await driver.sleep(500);
                
                const isChecked = await paymentOptions[0].isSelected();
                expect(isChecked).to.be.true;
            }
        });

        it('should apply coupon code', async function() {
            await driver.get(`${config.baseUrl}/checkout`);
            
            // Find coupon input
            const couponInputs = await driver.findElements(By.css('input[name="coupon"], input[placeholder*="coupon"]'));
            
            if (couponInputs.length > 0) {
                await couponInputs[0].sendKeys('TESTCODE');
                
                // Click apply button
                const applyBtn = await driver.findElement(By.css('button:contains("Apply"), .apply-coupon-btn'));
                await applyBtn.click();
                
                await driver.sleep(1000);
                
                // Check for success or error message
                const messages = await driver.findElements(By.css('.message, .alert, .notification'));
                expect(messages.length).to.be.greaterThan(0);
            }
        });
    });

    describe('Order History', function() {
        it('should display order history page', async function() {
            await driver.get(`${config.baseUrl}/orders`);
            
            // Check for orders table or list
            const ordersContainer = await waitForElement(driver, By.css('.orders, [data-testid="orders-list"], .order-history'));
            expect(await ordersContainer.isDisplayed()).to.be.true;
        });

        it('should view order details', async function() {
            await driver.get(`${config.baseUrl}/orders`);
            
            // Find first order
            const orderLinks = await driver.findElements(By.css('.order-item, [data-testid="order-link"], .view-order-btn'));
            
            if (orderLinks.length > 0) {
                await orderLinks[0].click();
                await driver.sleep(1000);
                
                // Verify on order detail page
                const currentUrl = await driver.getCurrentUrl();
                expect(currentUrl).to.include('order');
            }
        });

        it('should display order status', async function() {
            await driver.get(`${config.baseUrl}/orders`);
            
            // Find status elements
            const statuses = await driver.findElements(By.css('.order-status, [data-testid="order-status"], .status-badge'));
            
            if (statuses.length > 0) {
                const statusText = await statuses[0].getText();
                expect(statusText).to.not.be.empty;
            }
        });
    });
});
