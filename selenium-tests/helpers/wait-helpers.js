import { By, until } from 'selenium-webdriver';
import config from '../config.js';

/**
 * Wait for element to be visible
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @param {number} timeout 
 * @returns {Promise<WebElement>}
 */
export async function waitForElement(driver, locator, timeout = config.defaultTimeout) {
    return await driver.wait(until.elementLocated(locator), timeout);
}

/**
 * Wait for element to be visible and return it
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @param {number} timeout 
 * @returns {Promise<WebElement>}
 */
export async function waitForElementVisible(driver, locator, timeout = config.defaultTimeout) {
    const element = await waitForElement(driver, locator, timeout);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
}

/**
 * Wait for element to be clickable
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @param {number} timeout 
 * @returns {Promise<WebElement>}
 */
export async function waitForElementClickable(driver, locator, timeout = config.defaultTimeout) {
    const element = await waitForElement(driver, locator, timeout);
    await driver.wait(until.elementIsEnabled(element), timeout);
    return element;
}

/**
 * Wait for URL to contain specific text
 * @param {WebDriver} driver 
 * @param {string} text 
 * @param {number} timeout 
 * @returns {Promise<boolean>}
 */
export async function waitForUrlContains(driver, text, timeout = config.defaultTimeout) {
    try {
        await driver.wait(until.urlContains(text), timeout);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Wait for text to be present in element
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @param {string} text 
 * @param {number} timeout 
 * @returns {Promise<boolean>}
 */
export async function waitForTextInElement(driver, locator, text, timeout = config.defaultTimeout) {
    try {
        const element = await waitForElement(driver, locator, timeout);
        await driver.wait(until.elementTextContains(element, text), timeout);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if element is present
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @returns {Promise<boolean>}
 */
export async function isElementPresent(driver, locator) {
    try {
        await driver.findElement(locator);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Scroll to element
 * @param {WebDriver} driver 
 * @param {WebElement} element 
 */
export async function scrollToElement(driver, element) {
    await driver.executeScript('arguments[0].scrollIntoView(true);', element);
}

/**
 * Wait for page to fully load
 * @param {WebDriver} driver 
 * @param {number} timeout 
 */
export async function waitForPageLoad(driver, timeout = config.pageLoadTimeout) {
    await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    }, timeout);
}

/**
 * Wait for multiple elements to be located
 * @param {WebDriver} driver 
 * @param {By} locator 
 * @param {number} timeout 
 * @returns {Promise<WebElement[]>}
 */
export async function waitForElements(driver, locator, timeout = config.defaultTimeout) {
    await driver.wait(until.elementsLocated(locator), timeout);
    return await driver.findElements(locator);
}
