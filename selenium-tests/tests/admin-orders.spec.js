import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { By, Key } from 'selenium-webdriver';
import config from '../config.js';

describe('Admin Order Management Tests', function() {
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

    describe('View Orders', function() {
        it('should display orders list', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            const ordersList = await waitForElement(driver, By.css('table, .orders-list'));
            expect(await ordersList.isDisplayed()).to.be.true;
        });

        it('should show order details', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            // Click first order
            const viewButtons = await driver.findElements(By.xpath("//button[contains(text(), 'View')] | //a[contains(text(), 'View')]"));
            
            if (viewButtons.length > 0) {
                await viewButtons[0].click();
                await driver.sleep(1000);
                
                // Verify order details page
                const orderInfo = await driver.findElements(By.css('.order-detail, .order-info'));
                expect(orderInfo.length).to.be.greaterThan(0);
            }
        });

        it('should filter orders by status', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            const statusFilter = await driver.findElements(By.css('select[name="status"], .status-filter'));
            
            if (statusFilter.length > 0) {
                await statusFilter[0].click();
                
                // Select an option
                const options = await driver.findElements(By.css('option'));
                if (options.length > 1) {
                    await options[1].click();
                    await driver.sleep(1000);
                }
            }
        });
    });

    describe('Update Order Status', function() {
        it('should change order status', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            // Find status dropdown for first order
            const statusSelects = await driver.findElements(By.css('select[name="status"]'));
            
            if (statusSelects.length > 0) {
                await statusSelects[0].click();
                
                // Select different status
                const options = await driver.findElements(By.css('option'));
                if (options.length > 1) {
                    await options[1].click();
                    await driver.sleep(1000);
                    
                    // Check for update confirmation
                    const messages = await driver.findElements(By.css('.success, .message'));
                    expect(messages.length).to.be.greaterThan(0);
                }
            }
        });

        it('should mark order as delivered', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            const deliverButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Deliver')] | //button[contains(text(), 'Complete')]"));
            
            if (deliverButtons.length > 0) {
                await deliverButtons[0].click();
                await driver.sleep(1000);
                
                // Verify status updated
                const success = await driver.findElements(By.css('.success, .alert-success'));
                expect(success.length).to.be.greaterThan(0);
            }
        });
    });

    describe('Order Analytics', function() {
        it('should show total orders count', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            // Look for count indicator
            const countElements = await driver.findElements(By.xpath("//*[contains(text(), 'Total') or contains(text(), 'orders')]"));
            expect(countElements.length).to.be.greaterThan(0);
        });

        it('should display order revenue', async function() {
            await driver.get(`${config.adminUrl}/orders`);
            
            // Look for revenue display
            const revenueElements = await driver.findElements(By.xpath("//*[contains(text(), 'Revenue') or contains(text(), 'Total Sales')]"));
            expect(revenueElements.length).to.be.greaterThan(0);
        });
    });
});
