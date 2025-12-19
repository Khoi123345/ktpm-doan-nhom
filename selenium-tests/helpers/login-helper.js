import { By, Key } from 'selenium-webdriver';

/**
 * Login helper function that works with both admin and customer login forms
 * Uses Enter key method which works more reliably than button click
 */
export async function login(driver, url, email, password) {
    await driver.get(url);
    
    try {
        // Wait for email input
        const emailInput = await driver.wait(
            async () => {
                try {
                    const element = await driver.findElement(By.css('input[type="email"]'));
                    if (await element.isDisplayed()) {
                        return element;
                    }
                } catch (e) {
                    return null;
                }
            },
            10000,
            'Could not find email input'
        );
        
        await emailInput.clear();
        await emailInput.sendKeys(email);
        
        // Enter password
        const passwordInput = await driver.findElement(By.css('input[type="password"]'));
        await passwordInput.clear();
        await passwordInput.sendKeys(password);
        
        // Submit form using Enter key (more reliable than button click)
        await passwordInput.sendKeys(Key.RETURN);
        
        // Wait for redirect
        await driver.sleep(3000);
        
        return true;
    } catch (error) {
        console.error('Login failed:', error.message);
        return false;
    }
}

/**
 * Admin-specific login
 */
export async function adminLogin(driver, adminUrl, email, password) {
    return await login(driver, `${adminUrl}/login`, email, password);
}

/**
 * Customer-specific login
 */
export async function customerLogin(driver, baseUrl, email, password) {
    return await login(driver, `${baseUrl}/login`, email, password);
}
