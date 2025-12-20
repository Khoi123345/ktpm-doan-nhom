import { By, Key } from 'selenium-webdriver';
import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import config from '../config.js';

describe('E2E: Mua Sach - Gio Hang va Mua Ngay', function() {
    let driver;
    let testUser;

    beforeEach(async function() {
        this.timeout(120000);
        driver = await createDriver();
        
        // Tao thong tin user moi cho moi test
        const timestamp = Date.now();
        testUser = {
            name: `Test User ${timestamp}`,
            email: `testuser${timestamp}@example.com`,
            password: 'Test123!@#'
        };
        
        console.log('\n--- DANG KY TAI KHOAN MOI ---');
        console.log('Email:', testUser.email);
        console.log('Password:', testUser.password);
        
        // Dang ky tai khoan moi
        await driver.get(`${config.baseUrl}/register`);
        await driver.sleep(2000);
        
        // Dien form dang ky
        const nameLabel = await driver.findElement(By.xpath("//label[contains(text(), 'Họ tên')]"));
        const nameInputId = await nameLabel.getAttribute('for');
        const nameInput = await driver.findElement(By.id(nameInputId));
        await nameInput.clear();
        await nameInput.sendKeys(testUser.name);
        
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.clear();
        await emailInput.sendKeys(testUser.email);
        
        const passwordInputs = await driver.findElements(By.css('input[type="password"]'));
        await passwordInputs[0].clear();
        await passwordInputs[0].sendKeys(testUser.password);
        await passwordInputs[1].clear();
        await passwordInputs[1].sendKeys(testUser.password);
        
        // Tim va click nut Dang ky
        const allButtons = await driver.findElements(By.css('form button[type="submit"]'));
        let registerButton = null;
        for (let button of allButtons) {
            const buttonText = await button.getText();
            if (buttonText.includes('Đăng ký')) {
                registerButton = button;
                break;
            }
        }
        
        if (registerButton) {
            await registerButton.click();
        } else {
            throw new Error('Khong tim thay nut Dang ky');
        }
        
        await driver.sleep(3000);
        console.log('✓ Da dang ky tai khoan thanh cong\n');
    });

    afterEach(async function() {
        if (driver) {
            await quitDriver(driver);
        }
    });

    // Scenario 1: Them vao gio hang -> Xem gio hang -> Thanh toan
    it('TH1: Them sach vao gio hang, xem gio hang va hoan tat don hang voi COD', async function() {
        this.timeout(120000);
        console.log('\n========== SCENARIO 1: ADD TO CART -> VIEW CART -> CHECKOUT ==========');
        
        // Step 1: Kiem tra da dang nhap tu beforeEach
        console.log('\n--- STEP 1: Kiem tra da dang nhap ---');
        let urlAfterRegister = await driver.getCurrentUrl();
        console.log('URL hien tai:', urlAfterRegister);
        
        // Neu chua o trang chu, chuyen den trang chu
        if (!urlAfterRegister.includes('/books') && !urlAfterRegister.includes(config.baseUrl + '/')) {
            await driver.get(config.baseUrl);
            await driver.sleep(2000);
        }
        console.log('✓ Da dang nhap thanh cong');

        // Step 2: Di den trang sach
        console.log('\n--- STEP 2: Di den trang sach ---');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(2000);

        // Step 3: Tim va chon sach Gigantitanic
        console.log('\n--- STEP 3: Tim va chon sach Gigantitanic ---');
        
        // Tim sach Gigantitanic
        const gigantiBook = await waitForElement(driver, By.xpath("//a[contains(@href, '/books/') and .//text()[contains(., 'Gigantitanic')]]"), 10000);
        await gigantiBook.click();
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log(`✓ Da mo trang chi tiet sach Gigantitanic: ${currentUrl}`);

        // Step 4: Them vao gio hang
        console.log('\n--- STEP 4: Them vao gio hang ---');
        const addToCartButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Thêm vào giỏ') or contains(text(), 'Thêm Vào Giỏ') or contains(text(), 'Add to Cart')]"), 10000);
        await addToCartButton.click();
        await driver.sleep(2000);
        console.log('✓ Da them sach vao gio hang');

        // Step 5: Mo gio hang
        console.log('\n--- STEP 5: Mo gio hang ---');
        const cartIcon = await waitForElement(driver, By.css('a[href*="/cart"], button[class*="cart"]'), 10000);
        await cartIcon.click();
        await driver.sleep(2000);
        
        const cartUrl = await driver.getCurrentUrl();
        console.log(`✓ Da mo gio hang: ${cartUrl}`);
        expect(cartUrl).to.include('/cart', 'Khong chuyen den trang gio hang');

        // Step 6: Kiem tra gio hang co san pham
        console.log('\n--- STEP 6: Kiem tra gio hang ---');
        const cartItems = await waitForElements(driver, By.css('div[class*="cart"], div[class*="item"], img'), 5000);
        console.log(`✓ Gio hang co ${cartItems.length} san pham`);
        
        // Step 7: Tien hanh thanh toan
        console.log('\n--- STEP 7: Tien hanh thanh toan ---');
        
        // Tim nut thanh toan - co the co so luong trong ngoac
        const checkoutButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Tiến Hành Thanh Toán') or contains(text(), 'Tiến hành thanh toán')]"), 10000);
        await checkoutButton.click();
        await driver.sleep(2000);
        
        const checkoutUrl = await driver.getCurrentUrl();
        console.log(`✓ Da chuyen den trang thanh toan: ${checkoutUrl}`);

        // Step 8: Dien thong tin giao hang
        console.log('\n--- STEP 8: Dien thong tin giao hang ---');
        
        // Doi trang load
        await driver.sleep(2000);
        
        // 1. Ho va ten - da co san tu user profile
        console.log('✓ Ho va ten da duoc dien san');

        // 2. So dien thoai
        const phoneInput = await waitForElement(driver, By.css('input[placeholder="0123456789"]'), 5000);
        await phoneInput.clear();
        await phoneInput.sendKeys('0123456789');
        console.log('✓ Nhap so dien thoai');
        await driver.sleep(500);

        // 3. Tinh/Thanh pho - click input de mo dropdown, go de search
        const provinceInput = await waitForElement(driver, By.xpath("//label[contains(text(), 'Tỉnh/Thành phố')]/..//input"), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", provinceInput);
        await driver.sleep(500);
        await provinceInput.click();
        await driver.sleep(500);
        await provinceInput.sendKeys('Hà Nội');
        await driver.sleep(1000);
        // Nhan Enter hoac click vao item dau tien
        const provinceItem = await driver.findElements(By.xpath("//div[contains(text(), 'Hà Nội')]"));
        if (provinceItem.length > 0) {
            await provinceItem[0].click();
        } else {
            await provinceInput.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon tinh/thanh pho');
        await driver.sleep(1000);

        // 4. Quan/Huyen - click input de mo dropdown, go de search
        const districtInput = await waitForElement(driver, By.xpath("//label[contains(text(), 'Quận/Huyện')]/..//input"), 5000);
        await districtInput.click();
        await driver.sleep(500);
        await districtInput.sendKeys('Hoàn Kiếm');
        await driver.sleep(1000);
        const districtItem = await driver.findElements(By.xpath("//div[contains(text(), 'Hoàn Kiếm')]"));
        if (districtItem.length > 0) {
            await districtItem[0].click();
        } else {
            await districtInput.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon quan/huyen');
        await driver.sleep(1000);

        // 5. Phuong/Xa - click input de mo dropdown, go de search
        const wardInput = await waitForElement(driver, By.xpath("//label[contains(text(), 'Phường/Xã')]/..//input"), 5000);
        await wardInput.click();
        await driver.sleep(500);
        await wardInput.sendKeys('Phúc Tân');
        await driver.sleep(1000);
        const wardItem = await driver.findElements(By.xpath("//div[contains(text(), 'Phúc Tân')]"));
        if (wardItem.length > 0) {
            await wardItem[0].click();
        } else {
            await wardInput.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon phuong/xa');
        await driver.sleep(1000);

        // 6. Dia chi giao hang
        const addressInput = await waitForElement(driver, By.css('input[placeholder*="Số nhà, tên đường"]'), 5000);
        await addressInput.clear();
        await addressInput.sendKeys('123 Duong Nguyen Trai');
        console.log('✓ Nhap dia chi giao hang');

        await driver.sleep(1000);

        await driver.sleep(1000);

        // Step 9: Chon phuong thuc thanh toan COD
        console.log('\n--- STEP 9: Chon phuong thuc thanh toan COD ---');
        const codRadio = await waitForElement(driver, By.xpath("//input[@type='radio' and (contains(@value, 'COD') or following-sibling::*[contains(text(), 'COD')] or preceding-sibling::*[contains(text(), 'COD')])]"), 10000);
        await codRadio.click();
        await driver.sleep(1000);
        console.log('✓ Da chon phuong thuc COD');

        // Step 10: Hoan tat don hang
        console.log('\n--- STEP 10: Hoan tat don hang ---');
        const placeOrderButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Đặt Hàng Ngay') or contains(text(), 'Đặt Hàng')]"), 10000);
        await placeOrderButton.click();
        await driver.sleep(3000);

        const finalUrl = await driver.getCurrentUrl();
        console.log(`✓ Don hang da hoan tat: ${finalUrl}`);
        
        expect(finalUrl).to.satisfy(url => 
            url.includes('/success') || 
            url.includes('/order') || 
            url.includes('/confirmation') ||
            url.includes('/thankyou'),
            'Khong chuyen den trang hoan tat don hang'
        );
        
        console.log('\n========== SCENARIO 1 HOAN TAT THANH CONG ==========\n');
    });

    // Scenario 2: Mua ngay -> Thanh toan
    it('TH2: Mua ngay va hoan tat don hang voi COD', async function() {
        this.timeout(120000);
        console.log('\n========== SCENARIO 2: BUY NOW -> CHECKOUT ==========');
        
        // Step 1: Kiem tra da dang nhap tu beforeEach
        console.log('\n--- STEP 1: Kiem tra da dang nhap ---');
        let urlAfterRegister = await driver.getCurrentUrl();
        console.log('URL hien tai:', urlAfterRegister);
        
        // Neu chua o trang chu, chuyen den trang chu
        if (!urlAfterRegister.includes('/books') && !urlAfterRegister.includes(config.baseUrl + '/')) {
            await driver.get(config.baseUrl);
            await driver.sleep(2000);
        }
        console.log('✓ Da dang nhap thanh cong');

        // Step 2: Di den trang sach
        console.log('\n--- STEP 2: Di den trang sach ---');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(2000);

        // Step 3: Tim va chon sach Gigantitanic
        console.log('\n--- STEP 3: Tim va chon sach Gigantitanic ---');
        
        // Tim sach Gigantitanic
        const gigantiBook = await waitForElement(driver, By.xpath("//a[contains(@href, '/books/') and .//text()[contains(., 'Gigantitanic')]]"), 10000);
        await gigantiBook.click();
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log(`✓ Da mo trang chi tiet sach Gigantitanic: ${currentUrl}`);

        // Step 4: Click nut Mua Ngay
        console.log('\n--- STEP 4: Click nut Mua Ngay ---');
        const buyNowButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Mua Ngay')]"), 10000);
        await buyNowButton.click();
        await driver.sleep(2000);
        
        const checkoutUrl = await driver.getCurrentUrl();
        console.log(`✓ Da chuyen den trang thanh toan: ${checkoutUrl}`);

        // Step 5: Dien thong tin giao hang
        console.log('\n--- STEP 5: Dien thong tin giao hang ---');
        
        // Doi trang load
        await driver.sleep(2000);
        
        // 1. Ho va ten - da co san tu user profile
        console.log('✓ Ho va ten da duoc dien san');

        // 2. So dien thoai
        const phoneInput2 = await waitForElement(driver, By.css('input[placeholder="0123456789"]'), 5000);
        await phoneInput2.clear();
        await phoneInput2.sendKeys('0987654321');
        console.log('✓ Nhap so dien thoai');
        await driver.sleep(500);

        // 3. Tinh/Thanh pho - click input de mo dropdown, go de search
        const provinceInput2 = await waitForElement(driver, By.xpath("//label[contains(text(), 'Tỉnh/Thành phố')]/..//input"), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", provinceInput2);
        await driver.sleep(500);
        await provinceInput2.click();
        await driver.sleep(500);
        await provinceInput2.sendKeys('Hà Nội');
        await driver.sleep(1000);
        // Nhan Enter hoac click vao item dau tien
        const provinceItem2 = await driver.findElements(By.xpath("//div[contains(text(), 'Hà Nội')]"));
        if (provinceItem2.length > 0) {
            await provinceItem2[0].click();
        } else {
            await provinceInput2.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon tinh/thanh pho');
        await driver.sleep(1000);

        // 4. Quan/Huyen - click input de mo dropdown, go de search
        const districtInput2 = await waitForElement(driver, By.xpath("//label[contains(text(), 'Quận/Huyện')]/..//input"), 5000);
        await districtInput2.click();
        await driver.sleep(500);
        await districtInput2.sendKeys('Hoàn Kiếm');
        await driver.sleep(1000);
        const districtItem2 = await driver.findElements(By.xpath("//div[contains(text(), 'Hoàn Kiếm')]"));
        if (districtItem2.length > 0) {
            await districtItem2[0].click();
        } else {
            await districtInput2.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon quan/huyen');
        await driver.sleep(1000);

        // 5. Phuong/Xa - click input de mo dropdown, go de search
        const wardInput2 = await waitForElement(driver, By.xpath("//label[contains(text(), 'Phường/Xã')]/..//input"), 5000);
        await wardInput2.click();
        await driver.sleep(500);
        await wardInput2.sendKeys('Phúc Tân');
        await driver.sleep(1000);
        const wardItem2 = await driver.findElements(By.xpath("//div[contains(text(), 'Phúc Tân')]"));
        if (wardItem2.length > 0) {
            await wardItem2[0].click();
        } else {
            await wardInput2.sendKeys(Key.ENTER);
        }
        console.log('✓ Chon phuong/xa');
        await driver.sleep(1000);

        // 6. Dia chi giao hang
        const addressInput = await waitForElement(driver, By.css('input[placeholder*="Số nhà, tên đường"]'), 5000);
        await addressInput.clear();
        await addressInput.sendKeys('456 Duong Le Loi');
        console.log('✓ Nhap dia chi giao hang');

        await driver.sleep(1000);

        await driver.sleep(1000);

        // Step 6: Chon phuong thuc thanh toan COD
        console.log('\n--- STEP 6: Chon phuong thuc thanh toan COD ---');
        const codRadio = await waitForElement(driver, By.xpath("//input[@type='radio' and (contains(@value, 'COD') or following-sibling::*[contains(text(), 'COD')] or preceding-sibling::*[contains(text(), 'COD')])]"), 10000);
        await codRadio.click();
        await driver.sleep(1000);
        console.log('✓ Da chon phuong thuc COD');

        // Step 7: Hoan tat don hang
        console.log('\n--- STEP 7: Hoan tat don hang ---');
        const placeOrderButton = await waitForElement(driver, By.xpath("//*[contains(text(), 'Đặt Hàng Ngay') or contains(text(), 'Đặt Hàng')]"), 10000);
        await placeOrderButton.click();
        await driver.sleep(3000);

        const finalUrl = await driver.getCurrentUrl();
        console.log(`✓ Don hang da hoan tat: ${finalUrl}`);
        
        expect(finalUrl).to.satisfy(url => 
            url.includes('/success') || 
            url.includes('/order') || 
            url.includes('/confirmation') ||
            url.includes('/thankyou'),
            'Khong chuyen den trang hoan tat don hang'
        );
        
        console.log('\n========== SCENARIO 2 HOAN TAT THANH CONG ==========\n');
    });
});
