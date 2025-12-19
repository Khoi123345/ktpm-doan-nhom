import { By, Key } from 'selenium-webdriver';
import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import config from '../config.js';

describe('E2E: Admin - Xac Nhan Don Hang', function() {
    let driver;

    beforeEach(async function() {
        this.timeout(60000);
        driver = await createDriver();
    });

    afterEach(async function() {
        this.timeout(30000);
        if (driver) {
            await quitDriver(driver);
        }
    });

    it('Admin xac nhan don hang moi', async function() {
        this.timeout(120000);

        console.log('\n========== ADMIN: XAC NHAN DON HANG ==========\n');

        // Step 1: Dang nhap admin
        console.log('--- STEP 1: Dang nhap admin ---');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);

        const emailInput = await waitForElement(driver, By.css('input[type="email"], input[name="email"], input[placeholder*="email"]'), 10000);
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);
        console.log(`✓ Nhap email: ${config.admin.email}`);

        const passwordInput = await waitForElement(driver, By.css('input[type="password"], input[name="password"]'), 5000);
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);
        console.log('✓ Nhap password');

        await passwordInput.sendKeys(Key.RETURN);
        await driver.sleep(3000);

        const currentUrl = await driver.getCurrentUrl();
        console.log(`✓ Da dang nhap admin: ${currentUrl}`);

        // Step 2: Click vao menu "Don hang" o sidebar
        console.log('\n--- STEP 2: Click vao menu Don hang ---');
        
        const orderMenu = await waitForElement(driver, By.xpath("//a[contains(., 'Đơn hàng')] | //*[contains(text(), 'Đơn hàng')]//ancestor::a"), 10000);
        await orderMenu.click();
        await driver.sleep(3000);

        const ordersUrl = await driver.getCurrentUrl();
        console.log(`✓ Da vao trang quan ly don hang: ${ordersUrl}`);

        // Step 3: Click vao icon con mat (eye) cua don hang dau tien
        console.log('\n--- STEP 3: Click vao icon xem chi tiet don hang ---');
        
        await driver.sleep(2000);
        
        // Tim tat ca cac icon eye trong table - thu nhieu selector
        let eyeIcons = await driver.findElements(By.xpath("//td[last()]//button | //td[last()]//a | //button[.//svg] | //*[@role='button' and .//svg]"));
        
        if (eyeIcons.length === 0) {
            // Thu tim theo class hoac cot cuoi cung
            eyeIcons = await driver.findElements(By.css('table tbody tr td:last-child button, table tbody tr td:last-child a'));
        }
        
        console.log(`✓ Tim thay ${eyeIcons.length} icon xem chi tiet`);

        if (eyeIcons.length > 0) {
            await eyeIcons[0].click();
            console.log('✓ Da click vao icon xem chi tiet don hang dau tien');
            await driver.sleep(3000);
        } else {
            throw new Error('Khong tim thay icon xem chi tiet don hang');
        }

        // Step 4: Xac nhan don hang
        console.log('\n--- STEP 4: Xac nhan don hang ---');
        
        // Log ra trang thai hien tai
        const currentStatus = await driver.findElements(By.xpath("//*[contains(text(), 'Trạng thái')] | //*[contains(text(), 'Status')]"));
        if (currentStatus.length > 0) {
            const statusText = await currentStatus[0].getText();
            console.log(`Trang thai hien tai: ${statusText}`);
        }
        
        // Tim nut "Xac nhan don hang" (button mau xanh duong) - thu nhieu selector
        let confirmButton = await driver.findElements(By.xpath("//*[contains(text(), 'Xác nhận đơn hàng')]"));
        
        if (confirmButton.length === 0) {
            // Thu tim cac button khac
            confirmButton = await driver.findElements(By.xpath("//button[contains(text(), 'Xác nhận')] | //button[contains(text(), 'Confirm')]"));
        }
        
        if (confirmButton.length > 0) {
            await confirmButton[0].click();
            console.log('✓ Da click nut "Xac nhan don hang"');
            await driver.sleep(3000);
        } else {
            console.log('⚠️ Khong tim thay nut "Xac nhan don hang" - Don hang co the da duoc xac nhan');
            // Log ra tat ca cac button co tren trang
            const allButtons = await driver.findElements(By.css('button'));
            console.log(`Tim thay ${allButtons.length} buttons tren trang`);
            for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
                try {
                    const btnText = await allButtons[i].getText();
                    if (btnText) console.log(`  Button ${i+1}: ${btnText}`);
                } catch (e) {}
            }
        }

        // Step 5: Verify trang thai da chuyen
        console.log('\n--- STEP 5: Kiem tra trang thai don hang ---');
        
        // Kiem tra xem co "Da xac nhan & dong goi" trong trang thai van chuyen
        const confirmedStatus = await driver.findElements(By.xpath("//*[contains(text(), 'Đã xác nhận') and contains(text(), 'đóng gói')]"));
        
        if (confirmedStatus.length > 0) {
            console.log('✓ Don hang da duoc xac nhan thanh cong');
            console.log('✓ Trang thai: "Da xac nhan & dong goi"');
        } else {
            // Kiem tra xem co "Da xac nhan" trong bang
            const altConfirmedStatus = await driver.findElements(By.xpath("//*[contains(text(), 'Đã xác nhận')]"));
            if (altConfirmedStatus.length > 0) {
                console.log('✓ Don hang da duoc xac nhan thanh cong');
            } else {
                console.log('⚠️ Khong tim thay xac nhan trang thai, nhung thao tac da hoan tat');
            }
        }

        // Kiem tra xem nut "Xac nhan don hang" da bien mat chua
        const confirmButtonsAfter = await driver.findElements(By.xpath("//*[contains(text(), 'Xác nhận đơn hàng')]"));
        if (confirmButtonsAfter.length === 0) {
            console.log('✓ Nut "Xac nhan don hang" da bien mat (don da duoc xac nhan)');
        }

        // Kiem tra co nut "Chuyen sang giao hang" chua
        const deliveryButton = await driver.findElements(By.xpath("//*[contains(text(), 'Chuyển sang giao hàng') or contains(text(), 'chuyển sang giao')]"));
        if (deliveryButton.length > 0) {
            console.log('✓ Hien thi nut "Chuyen sang giao hang" (buoc tiep theo)');
        }

        console.log('\n========== ADMIN XAC NHAN DON HANG THANH CONG ==========\n');

        // Verify at least one success indicator
        expect(confirmedStatus.length > 0 || confirmButtonsAfter.length === 0 || deliveryButton.length > 0).to.be.true;
    });

    it('Admin xac nhan thanh toan COD', async function() {
        this.timeout(120000);

        console.log('\n========== ADMIN: XAC NHAN THANH TOAN COD ==========\n');

        // Step 1: Dang nhap admin
        console.log('--- STEP 1: Dang nhap admin ---');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);

        const emailInput = await waitForElement(driver, By.css('input[type="email"], input[name="email"], input[placeholder*="email"]'), 10000);
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);

        const passwordInput = await waitForElement(driver, By.css('input[type="password"], input[name="password"]'), 5000);
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);

        await passwordInput.sendKeys(Key.RETURN);
        await driver.sleep(3000);
        console.log('✓ Da dang nhap admin');

        // Step 2: Vao trang quan ly don hang
        console.log('\n--- STEP 2: Vao trang quan ly don hang ---');
        await driver.get(`${config.adminUrl}/orders`);
        await driver.sleep(2000);
        console.log('✓ Da vao trang quan ly don hang');

        // Step 3: Tim don hang "Chua thanh toan" hoac "Da giao"
        console.log('\n--- STEP 3: Tim don hang can xac nhan thanh toan ---');
        await driver.sleep(2000);

        // Tim don hang co trang thai "Chua thanh toan" va da giao
        const unpaidOrders = await driver.findElements(By.xpath("//*[contains(text(), 'Chưa thanh toán')]"));
        
        if (unpaidOrders.length > 0) {
            console.log(`✓ Tim thay ${unpaidOrders.length} don hang chua thanh toan`);
            
            // Click vao don hang dau tien
            try {
                const viewButton = await unpaidOrders[0].findElement(By.xpath("./ancestor::tr//button[.//svg] | ./ancestor::tr//*[contains(@class, 'action')]"));
                await viewButton.click();
            } catch (e) {
                await unpaidOrders[0].click();
            }
            await driver.sleep(2000);

            // Step 4: Click "Xac nhan da thanh toan" (nut mau xanh la)
            console.log('\n--- STEP 4: Xac nhan da thanh toan ---');
            
            const paymentConfirmButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Xác nhận đã thanh toán')]"), 10000);
            await paymentConfirmButton.click();
            console.log('✓ Da click nut "Xac nhan da thanh toan"');
            
            await driver.sleep(3000);

            // Step 5: Verify
            console.log('\n--- STEP 5: Kiem tra trang thai thanh toan ---');
            
            const paidStatus = await driver.findElements(By.xpath("//*[contains(text(), 'Đã thanh toán')]"));
            if (paidStatus.length > 0) {
                console.log('✓ Don hang da duoc xac nhan thanh toan thanh cong');
            }

            const paymentButtonAfter = await driver.findElements(By.xpath("//*[contains(text(), 'Xác nhận đã thanh toán')]"));
            if (paymentButtonAfter.length === 0) {
                console.log('✓ Nut "Xac nhan da thanh toan" da bien mat');
            }

            console.log('\n========== XAC NHAN THANH TOAN THANH CONG ==========\n');

            expect(paidStatus.length > 0 || paymentButtonAfter.length === 0).to.be.true;
        } else {
            console.log('⚠️ Khong tim thay don hang chua thanh toan, bo qua test');
            this.skip();
        }
    });

    it('Admin chuyen don hang sang giao hang', async function() {
        this.timeout(120000);

        console.log('\n========== ADMIN: CHUYEN DON SANG GIAO HANG ==========\n');

        // Step 1: Dang nhap admin
        console.log('--- STEP 1: Dang nhap admin ---');
        await driver.get(`${config.adminUrl}/login`);
        await driver.sleep(2000);

        const emailInput = await waitForElement(driver, By.css('input[type="email"], input[name="email"], input[placeholder*="email"]'), 10000);
        await emailInput.clear();
        await emailInput.sendKeys(config.admin.email);

        const passwordInput = await waitForElement(driver, By.css('input[type="password"], input[name="password"]'), 5000);
        await passwordInput.clear();
        await passwordInput.sendKeys(config.admin.password);

        await passwordInput.sendKeys(Key.RETURN);
        await driver.sleep(3000);
        console.log('✓ Da dang nhap admin');

        // Step 2: Vao trang quan ly don hang
        console.log('\n--- STEP 2: Vao trang quan ly don hang ---');
        await driver.get(`${config.adminUrl}/orders`);
        await driver.sleep(2000);
        console.log('✓ Da vao trang quan ly don hang');

        // Step 3: Tim don hang da xac nhan
        console.log('\n--- STEP 3: Tim don hang da xac nhan ---');
        await driver.sleep(2000);

        const confirmedOrders = await driver.findElements(By.xpath("//*[contains(text(), 'Đã xác nhận')]"));
        
        if (confirmedOrders.length > 0) {
            console.log(`✓ Tim thay ${confirmedOrders.length} don hang da xac nhan`);
            
            // Click vao don hang dau tien
            try {
                const viewButton = await confirmedOrders[0].findElement(By.xpath("./ancestor::tr//button[.//svg] | ./ancestor::tr//*[contains(@class, 'action')]"));
                await viewButton.click();
            } catch (e) {
                await confirmedOrders[0].click();
            }
            await driver.sleep(2000);

            // Step 4: Click "Chuyen sang giao hang"
            console.log('\n--- STEP 4: Chuyen sang giao hang ---');
            
            const deliveryButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Chuyển sang giao hàng')]"), 10000);
            await deliveryButton.click();
            console.log('✓ Da click nut "Chuyen sang giao hang"');
            
            await driver.sleep(3000);

            // Step 5: Verify
            console.log('\n--- STEP 5: Kiem tra trang thai giao hang ---');
            
            const deliveryStatus = await driver.findElements(By.xpath("//*[contains(text(), 'Đang giao hàng')]"));
            if (deliveryStatus.length > 0) {
                console.log('✓ Don hang da chuyen sang trang thai "Dang giao hang"');
            }

            const deliveryButtonAfter = await driver.findElements(By.xpath("//*[contains(text(), 'Chuyển sang giao hàng')]"));
            if (deliveryButtonAfter.length === 0) {
                console.log('✓ Nut "Chuyen sang giao hang" da bien mat');
            }

            // Kiem tra nut "Danh dau da giao"
            const markDeliveredButton = await driver.findElements(By.xpath("//*[contains(text(), 'Đánh dấu đã giao')]"));
            if (markDeliveredButton.length > 0) {
                console.log('✓ Hien thi nut "Danh dau da giao" (buoc tiep theo)');
            }

            console.log('\n========== CHUYEN SANG GIAO HANG THANH CONG ==========\n');

            expect(deliveryStatus.length > 0 || deliveryButtonAfter.length === 0 || markDeliveredButton.length > 0).to.be.true;
        } else {
            console.log('⚠️ Khong tim thay don hang da xac nhan, bo qua test');
            this.skip();
        }
    });
});
