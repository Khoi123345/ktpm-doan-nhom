import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import { createDriver, takeScreenshot, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { LoginPage } from '../page-objects/LoginPage.js';
import config from '../config.js';

describe('Registration Tests', function() {
    let driver;

    before(async function() {
        driver = await createDriver();
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should display registration form', async function() {
        await driver.get(`${config.baseUrl}/register`);
        
        const registerForm = await waitForElement(driver, By.css('form'));
        expect(await registerForm.isDisplayed()).to.be.true;
    });

    it('should register with valid information', async function() {
        await driver.get(`${config.baseUrl}/register`);
        
        // Fill name
        const nameInput = await waitForElement(driver, By.css('input[name="name"]'));
        await nameInput.sendKeys('New User');
        
        // Fill email
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.sendKeys(`newuser${Date.now()}@example.com`);
        
        // Fill password
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys('Password123!');
        
        // Submit
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        await driver.sleep(2000);
        
        // Should redirect or show success
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.not.include('/register');
    });

    it('should show error for duplicate email', async function() {
        await driver.get(`${config.baseUrl}/register`);
        
        const nameInput = await waitForElement(driver, By.css('input[name="name"]'));
        await nameInput.sendKeys('Test User');
        
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.sendKeys(config.testUser.email); // Existing email
        
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys('Password123!');
        
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        await driver.sleep(1000);
        
        // Should show error
        const errors = await driver.findElements(By.css('.error, .alert-error, .text-red-500'));
        expect(errors.length).to.be.greaterThan(0);
    });

    it('should validate password strength', async function() {
        await driver.get(`${config.baseUrl}/register`);
        
        const passwordInput = await waitForElement(driver, By.css('input[type="password"]'));
        await passwordInput.sendKeys('weak');
        
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        await driver.sleep(500);
        
        // Should show validation error
        const errors = await driver.findElements(By.css('.error, .invalid-feedback'));
        expect(errors.length).to.be.greaterThan(0);
    });
});

describe('Customer Login Tests', function() {
    let driver;
    let loginPage;

    // Hooks
    beforeEach(async function() {
        driver = await createDriver();
        loginPage = new LoginPage(driver);
    });

    afterEach(async function() {
        // Take screenshot on failure
        if (this.currentTest.state === 'failed' && config.screenshotOnFailure) {
            await takeScreenshot(driver, `FAILED_${this.currentTest.title}`);
        }
        await driver.quit();
    });

    it('should login successfully with valid credentials', async function() {
        await loginPage.navigateToCustomerLogin();
        await loginPage.login(config.testUser.email, config.testUser.password);
        
        // Wait a bit for navigation
        await driver.sleep(3000);
        
        // Debug: Print current URL
        const currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after login:', currentUrl);
        
        // Check for error messages
        const errorMsg = await loginPage.getErrorMessage();
        if (errorMsg) {
            console.log('Error message:', errorMsg);
        }
        
        // Verify login successful
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn).to.be.true;
        
        // Verify redirected away from login page
        expect(currentUrl).to.not.include('/login');
    });

    it('should show error with invalid email format', async function() {
        await loginPage.navigateToCustomerLogin();
        
        await loginPage.enterEmail('invalid-email');
        await loginPage.enterPassword(config.testUser.password);
        await loginPage.clickLoginButton();
        
        await driver.sleep(1000);
        
        // Should remain on login page
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('/login');
    });

    it('should fail login with wrong password', async function() {
        await loginPage.navigateToCustomerLogin();
        await loginPage.login(config.testUser.email, 'WrongPassword123');
        
        await driver.sleep(2000);
        
        // Should show error or remain on login page
        const currentUrl = await driver.getCurrentUrl();
        const errorMessage = await loginPage.getErrorMessage();
        
        expect(currentUrl.includes('/login') || errorMessage !== null).to.be.true;
    });

    it('should not login with empty fields', async function() {
        await loginPage.navigateToCustomerLogin();
        await loginPage.clickLoginButton();
        
        await driver.sleep(1000);
        
        // Should remain on login page
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('/login');
    });
});

describe('Admin Login Tests', function() {
    let driver;
    let loginPage;

    beforeEach(async function() {
        driver = await createDriver();
        loginPage = new LoginPage(driver);
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed' && config.screenshotOnFailure) {
            await takeScreenshot(driver, `FAILED_${this.currentTest.title}`);
        }
        await driver.quit();
    });

    it('should login admin successfully with valid credentials', async function() {
        await loginPage.navigateToAdminLogin();
        await loginPage.login(config.admin.email, config.admin.password);
        
        await driver.sleep(2000);
        
        // Verify login successful
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn).to.be.true;
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.not.include('/login');
    });

    it('should fail admin login with invalid credentials', async function() {
        await loginPage.navigateToAdminLogin();
        await loginPage.login('wrong@admin.com', 'WrongPassword');
        
        await driver.sleep(2000);
        
        // Should show error or remain on login page
        const currentUrl = await driver.getCurrentUrl();
        const errorMessage = await loginPage.getErrorMessage();
        
        expect(currentUrl.includes('/login') || errorMessage !== null).to.be.true;
    });
});
