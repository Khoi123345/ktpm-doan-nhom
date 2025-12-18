import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';

describe('Admin Dashboard Tests', function() {
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
            await emailInput.sendKeys(config.admin.email);
            
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            await passwordInput.sendKeys(config.admin.password);
            
            const submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            
            await driver.sleep(2000);
        } catch (error) {
            console.log('Already logged in as admin');
        }
    });

    describe('Dashboard Overview', function() {
        it('should display dashboard with statistics', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            // Check for stat cards
            const statCards = await waitForElements(driver, By.css('.stat-card, .dashboard-card, [data-testid="stat-card"]'), 5000);
            expect(statCards.length).to.be.greaterThan(0);
        });

        it('should show total revenue', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            // Find revenue display
            const revenueElements = await driver.findElements(By.xpath("//*[contains(text(), 'Revenue') or contains(text(), 'Sales') or contains(text(), 'Total')]"));
            expect(revenueElements.length).to.be.greaterThan(0);
        });

        it('should display recent orders', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            // Scroll to find orders section
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight / 2)');
            await driver.sleep(500);
            
            const ordersSection = await driver.findElements(By.css('.orders, .recent-orders, [data-testid="orders"]'));
            expect(ordersSection.length).to.be.greaterThan(0);
        });

        it('should show charts or graphs', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            // Look for chart elements
            const charts = await driver.findElements(By.css('canvas, .chart, svg[class*="recharts"]'));
            expect(charts.length).to.be.greaterThan(0);
        });
    });

    describe('Navigation', function() {
        it('should navigate to books management', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            const booksLink = await driver.findElements(By.xpath("//a[contains(text(), 'Books') or contains(text(), 'Products')]"));
            
            if (booksLink.length > 0) {
                await booksLink[0].click();
                await driver.sleep(1000);
                
                const currentUrl = await driver.getCurrentUrl();
                expect(currentUrl).to.include('books');
            }
        });

        it('should navigate to orders management', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            const ordersLink = await driver.findElements(By.xpath("//a[contains(text(), 'Orders') or contains(text(), 'Order')]"));
            
            if (ordersLink.length > 0) {
                await ordersLink[0].click();
                await driver.sleep(1000);
                
                const currentUrl = await driver.getCurrentUrl();
                expect(currentUrl).to.include('order');
            }
        });

        it('should navigate to users management', async function() {
            await driver.get(`${config.adminUrl}/dashboard`);
            
            const usersLink = await driver.findElements(By.xpath("//a[contains(text(), 'Users') or contains(text(), 'Customers')]"));
            
            if (usersLink.length > 0) {
                await usersLink[0].click();
                await driver.sleep(1000);
                
                const currentUrl = await driver.getCurrentUrl();
                expect(currentUrl).to.include('user');
            }
        });
    });
});
