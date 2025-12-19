import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';
import { faker } from '@faker-js/faker';

describe('DEBUG: Register Form Field Inspection', function() {
    let driver;
    let testUser;

    before(async function() {
        this.timeout(30000);
        driver = await createDriver();
        
        testUser = {
            name: 'Test User ' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'Test@123456'
        };
        
        console.log('\n🔍 DEBUG: Checking register form fields');
        console.log('Test user:', testUser);
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('should inspect and fill register form correctly', async function() {
        this.timeout(60000);

        console.log('\n1. Navigate to register page');
        await driver.get(`${config.baseUrl}/register`);
        await driver.sleep(3000);

        console.log('\n2. Find all input fields');
        const allInputs = await driver.findElements(By.css('input'));
        console.log(`Found ${allInputs.length} input elements`);

        // Check each input
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            try {
                const type = await input.getAttribute('type');
                const name = await input.getAttribute('name');
                const id = await input.getAttribute('id');
                const placeholder = await input.getAttribute('placeholder');
                const isDisplayed = await input.isDisplayed();
                
                console.log(`\nInput ${i + 1}:`, {
                    type,
                    name,
                    id,
                    placeholder,
                    isDisplayed
                });
            } catch (e) {
                console.log(`Input ${i + 1}: Could not get attributes`);
            }
        }

        console.log('\n3. Find all labels');
        const allLabels = await driver.findElements(By.css('label'));
        for (let i = 0; i < allLabels.length; i++) {
            try {
                const labelText = await allLabels[i].getText();
                const forAttr = await allLabels[i].getAttribute('for');
                console.log(`Label ${i + 1}: "${labelText}" (for: ${forAttr})`);
            } catch (e) {}
        }

        console.log('\n4. Fill form with explicit selectors');
        
        // Try to find name input by label
        try {
            console.log('\nLooking for "Họ tên" input...');
            const nameLabel = await driver.findElement(By.xpath("//label[contains(text(), 'Họ tên')]"));
            const nameInputId = await nameLabel.getAttribute('for');
            console.log('Name input ID from label:', nameInputId);
            
            const nameInput = await driver.findElement(By.id(nameInputId));
            await nameInput.clear();
            await nameInput.sendKeys(testUser.name);
            const nameValue = await nameInput.getAttribute('value');
            console.log('✓ Name filled:', nameValue);
        } catch (e) {
            console.log('❌ Could not fill name field:', e.message);
        }

        // Email
        try {
            console.log('\nLooking for "Email" input...');
            const emailInput = await driver.findElement(By.css('input[type="email"]'));
            await emailInput.clear();
            await emailInput.sendKeys(testUser.email);
            const emailValue = await emailInput.getAttribute('value');
            console.log('✓ Email filled:', emailValue);
        } catch (e) {
            console.log('❌ Could not fill email field:', e.message);
        }

        // Passwords
        try {
            console.log('\nLooking for password inputs...');
            const passwordInputs = await driver.findElements(By.css('input[type="password"]'));
            console.log(`Found ${passwordInputs.length} password inputs`);
            
            if (passwordInputs.length >= 2) {
                await passwordInputs[0].clear();
                await passwordInputs[0].sendKeys(testUser.password);
                console.log('✓ Password filled');
                
                await driver.sleep(1000); // Wait for validation
                
                await passwordInputs[1].clear();
                await passwordInputs[1].sendKeys(testUser.password);
                console.log('✓ Confirm password filled');
            }
        } catch (e) {
            console.log('❌ Could not fill password fields:', e.message);
        }

        console.log('\n5. Check form values before submit');
        const allFormInputs = await driver.findElements(By.css('form input'));
        for (let i = 0; i < allFormInputs.length; i++) {
            try {
                const value = await allFormInputs[i].getAttribute('value');
                const type = await allFormInputs[i].getAttribute('type');
                if (type !== 'password') {
                    console.log(`Form input ${i + 1} (${type}): "${value}"`);
                } else {
                    console.log(`Form input ${i + 1} (${type}): [hidden]`);
                }
            } catch (e) {}
        }

        console.log('\n6. Submit form');
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        await driver.sleep(5000);

        const urlAfterSubmit = await driver.getCurrentUrl();
        console.log('URL after submit:', urlAfterSubmit);

        // Check if there's an error message
        try {
            const errorElements = await driver.findElements(By.css('.error, [class*="error"], .alert'));
            if (errorElements.length > 0) {
                for (let el of errorElements) {
                    try {
                        const errorText = await el.getText();
                        if (errorText) {
                            console.log('Error message:', errorText);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        console.log('\n7. Try to login with registered credentials');
        await driver.get(`${config.baseUrl}/login`);
        await driver.sleep(2000);

        const loginEmail = await driver.findElement(By.css('input[type="email"]'));
        await loginEmail.sendKeys(testUser.email);

        const loginPassword = await driver.findElement(By.css('input[type="password"]'));
        await loginPassword.sendKeys(testUser.password);
        await loginPassword.sendKeys('\n');
        await driver.sleep(5000);

        const urlAfterLogin = await driver.getCurrentUrl();
        console.log('URL after login:', urlAfterLogin);

        if (urlAfterLogin.includes('/login')) {
            console.log('❌ Login failed - still on login page');
            try {
                const errorEl = await driver.findElement(By.css('.error, [class*="error"]'));
                const errorText = await errorEl.getText();
                console.log('Login error:', errorText);
            } catch (e) {}
        } else {
            console.log('✅ Login successful!');
        }
    });
});
