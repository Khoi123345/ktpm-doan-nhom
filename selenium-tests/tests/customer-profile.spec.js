import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { By } from 'selenium-webdriver';
import config from '../config.js';

describe('User Profile Tests', function() {
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

    describe('Profile Management', function() {
        it('should display profile page', async function() {
            await driver.get(`${config.baseUrl}/profile`);
            
            // Verify profile page loaded
            const profileForm = await waitForElement(driver, By.css('form, .profile-form'));
            expect(await profileForm.isDisplayed()).to.be.true;
        });

        it('should display user information', async function() {
            await driver.get(`${config.baseUrl}/profile`);
            
            // Check name field
            const nameInput = await waitForElement(driver, By.css('input[name="name"]'));
            const nameValue = await nameInput.getAttribute('value');
            expect(nameValue).to.not.be.empty;
            
            // Check email field
            const emailInput = await driver.findElement(By.css('input[name="email"]'));
            const emailValue = await emailInput.getAttribute('value');
            expect(emailValue).to.include('@');
        });

        it('should update profile information', async function() {
            await driver.get(`${config.baseUrl}/profile`);
            
            // Update name
            const nameInput = await waitForElement(driver, By.css('input[name="name"]'));
            await nameInput.clear();
            await nameInput.sendKeys('Updated Test User');
            
            // Submit
            const saveBtn = await driver.findElement(By.css('button[type="submit"], .save-btn'));
            await saveBtn.click();
            
            await driver.sleep(1000);
            
            // Check for success message
            const messages = await driver.findElements(By.css('.success, .alert-success, .text-green-500'));
            expect(messages.length).to.be.greaterThan(0);
        });

        it('should change password', async function() {
            await driver.get(`${config.baseUrl}/profile`);
            
            // Find password fields
            const currentPwdInputs = await driver.findElements(By.css('input[name="currentPassword"]'));
            
            if (currentPwdInputs.length > 0) {
                await currentPwdInputs[0].sendKeys('OldPassword123');
                
                const newPwdInput = await driver.findElement(By.css('input[name="newPassword"]'));
                await newPwdInput.sendKeys('NewPassword123');
                
                const confirmPwdInput = await driver.findElement(By.css('input[name="confirmPassword"]'));
                await confirmPwdInput.sendKeys('NewPassword123');
                
                const changeBtn = await driver.findElement(By.css('button:contains("Change"), .change-password-btn'));
                await changeBtn.click();
                
                await driver.sleep(1000);
                
                // Verify message appeared
                const messages = await driver.findElements(By.css('.message, .alert'));
                expect(messages.length).to.be.greaterThan(0);
            }
        });
    });

    describe('Logout', function() {
        it('should logout successfully', async function() {
            await driver.get(`${config.baseUrl}/`);
            
            // Find logout button (in header or dropdown)
            const logoutBtn = await driver.findElements(By.xpath("//*[contains(text(), 'Logout') or contains(text(), 'Log Out') or contains(text(), 'Sign Out')]"));
            
            if (logoutBtn.length > 0) {
                await logoutBtn[0].click();
                await driver.sleep(1000);
                
                // Should redirect to home or login
                const currentUrl = await driver.getCurrentUrl();
                expect(currentUrl).to.satisfy((url) => 
                    url.includes('/login') || url === `${config.baseUrl}/` || url === config.baseUrl
                );
            }
        });
    });
});
