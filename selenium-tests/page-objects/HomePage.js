import { By } from 'selenium-webdriver';
import { waitForElementVisible, waitForElementClickable, isElementPresent } from '../helpers/wait-helpers.js';
import config from '../config.js';

export class HomePage {
    constructor(driver) {
        this.driver = driver;
        
        // Locators
        this.searchInput = By.css("input[type='search'], input[placeholder*='Search'], input[name='search']");
        this.searchButton = By.css("button[type='submit']");
        this.bookItems = By.css(".book-item, .product-card, [data-testid='book-item']");
        this.loginLink = By.css("a[href*='login']");
        this.registerLink = By.css("a[href*='register']");
        this.cartLink = By.css("a[href*='cart']");
        this.userMenu = By.css(".user-menu, [data-testid='user-menu']");
    }

    /**
     * Navigate to home page
     */
    async navigate() {
        await this.driver.get(config.baseUrl);
    }

    /**
     * Search for a book
     * @param {string} searchTerm 
     */
    async searchBook(searchTerm) {
        const searchInputField = await waitForElementVisible(this.driver, this.searchInput);
        await searchInputField.clear();
        await searchInputField.sendKeys(searchTerm);
        
        const searchBtn = await waitForElementClickable(this.driver, this.searchButton);
        await searchBtn.click();
    }

    /**
     * Get all book items on page
     * @returns {Promise<WebElement[]>}
     */
    async getBookItems() {
        try {
            return await this.driver.findElements(this.bookItems);
        } catch (error) {
            return [];
        }
    }

    /**
     * Click on login link
     */
    async clickLogin() {
        const loginLinkElement = await waitForElementClickable(this.driver, this.loginLink);
        await loginLinkElement.click();
    }

    /**
     * Check if user is logged in
     * @returns {Promise<boolean>}
     */
    async isUserLoggedIn() {
        return await isElementPresent(this.driver, this.userMenu);
    }

    /**
     * Get page title
     * @returns {Promise<string>}
     */
    async getPageTitle() {
        return await this.driver.getTitle();
    }
}
