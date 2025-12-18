import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';
import config from '../config.js';

/**
 * Create and configure a Chrome WebDriver instance
 * @returns {Promise<WebDriver>}
 */
export async function createDriver() {
    const options = new chrome.Options();

    // Headless mode
    if (config.headless) {
        options.addArguments('--headless=new');
    }

    // Standard options for container environment
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments(`--window-size=${config.windowSize.width},${config.windowSize.height}`);
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.excludeSwitches('enable-automation');
    options.setUserPreferences({ 'credentials_enable_service': false });

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Set timeouts
    await driver.manage().setTimeouts({
        implicit: config.defaultTimeout,
        pageLoad: config.pageLoadTimeout
    });

    return driver;
}

/**
 * Take a screenshot and save it
 * @param {WebDriver} driver 
 * @param {string} name 
 * @returns {Promise<string>}
 */
export async function takeScreenshot(driver, name) {
    const screenshotDir = config.screenshotDir;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);

    const image = await driver.takeScreenshot();
    fs.writeFileSync(filepath, image, 'base64');

    console.log(`Screenshot saved: ${filepath}`);
    return filepath;
}

/**
 * Quit the driver instance
 * @param {WebDriver} driver 
 * @returns {Promise<void>}
 */
export async function quitDriver(driver) {
    if (driver) {
        await driver.quit();
    }
}
