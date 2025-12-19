import { By } from 'selenium-webdriver';
import { waitForElementVisible, waitForElementClickable } from '../helpers/wait-helpers.js';
import config from '../config.js';

export class LoginPage {
    constructor(driver) {
        this.driver = driver;
        
        // Locators
        this.emailInput = By.css("input[type='email'], input[name='email']");
        this.passwordInput = By.css("input[type='password'], input[name='password']");
        this.loginButton = By.css("button[type='submit']");
        this.errorMessage = By.css(".error, .alert-error, [role='alert']");
        this.successMessage = By.css(".success, .alert-success");
    }

    /**
     * Navigate to customer login page
     */
    async navigateToCustomerLogin() {
        await this.driver.get(`${config.baseUrl}/login`);
    }

    /**
     * Navigate to admin login page
     */
    async navigateToAdminLogin() {
        await this.driver.get(`${config.adminUrl}/login`);
    }

    /**
     * Enter email
     * @param {string} email 
     */
    async enterEmail(email) {
        const emailField = await waitForElementVisible(this.driver, this.emailInput);
        await emailField.clear();
        await emailField.sendKeys(email);
    }

    /**
     * Enter password
     * @param {string} password 
     */
    async enterPassword(password) {
        const passwordField = await waitForElementVisible(this.driver, this.passwordInput);
        await passwordField.clear();
        await passwordField.sendKeys(password);
    }

    /**
     * Click login button
     */
    async clickLoginButton() {
        const button = await waitForElementClickable(this.driver, this.loginButton);
        await button.click();
    }

    /**
     * Complete login process
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    /**
     * Get error message text
     * @returns {Promise<string|null>}
     */
    async getErrorMessage() {
        try {
            const errorElement = await waitForElementVisible(this.driver, this.errorMessage, 3000);
            return await errorElement.getText();
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if user is logged in
     * @returns {Promise<boolean>}
     */
    async isLoggedIn() {
        const currentUrl = await this.driver.getCurrentUrl();
        return !currentUrl.includes('/login');
    }
}
