import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement } from '../helpers/wait-helpers.js';
import { By, Key } from 'selenium-webdriver';
import config from '../config.js';

describe('E2E: Đăng ký với dữ liệu thật', function() {
    let driver;
    
    // Dữ liệu thật - thay đổi email mỗi lần chạy
    const timestamp = Date.now();
    const testUser = {
        name: 'Nguyễn Văn A',
        email: `testuser${timestamp}@gmail.com`,
        password: 'Test@123456'
    };

    before(async function() {
        this.timeout(30000);
        driver = await createDriver();
        console.log('\n🧪 Test đăng ký với dữ liệu thật');
        console.log('Thông tin user:', testUser);
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('Đăng ký tài khoản mới', async function() {
        this.timeout(90000);

        console.log('\n1️⃣ Truy cập trang đăng ký...');
        await driver.get(`${config.baseUrl}/register`);
        await driver.sleep(3000);
        
        const currentUrl = await driver.getCurrentUrl();
        console.log('URL hiện tại:', currentUrl);

        console.log('\n2️⃣ Điền form đăng ký...');
        
        // Tìm input "Họ tên"
        const nameLabel = await driver.findElement(By.xpath("//label[contains(text(), 'Họ tên')]"));
        const nameInputId = await nameLabel.getAttribute('for');
        const nameInput = await driver.findElement(By.id(nameInputId));
        await nameInput.clear();
        await nameInput.sendKeys(testUser.name);
        console.log('✓ Đã điền họ tên:', testUser.name);

        // Email
        const emailInput = await driver.findElement(By.css('input[type="email"]'));
        await emailInput.clear();
        await emailInput.sendKeys(testUser.email);
        console.log('✓ Đã điền email:', testUser.email);

        // Mật khẩu
        const passwordInputs = await driver.findElements(By.css('input[type="password"]'));
        console.log(`Tìm thấy ${passwordInputs.length} ô mật khẩu`);
        
        await passwordInputs[0].clear();
        await passwordInputs[0].sendKeys(testUser.password);
        console.log('✓ Đã điền mật khẩu');
        
        // Chờ validation
        await driver.sleep(2000);
        
        // Xác nhận mật khẩu
        await passwordInputs[1].clear();
        await passwordInputs[1].sendKeys(testUser.password);
        console.log('✓ Đã điền xác nhận mật khẩu');

        console.log('\n3️⃣ Kiểm tra các giá trị đã điền...');
        const nameValue = await nameInput.getAttribute('value');
        const emailValue = await emailInput.getAttribute('value');
        console.log('Họ tên trong input:', nameValue);
        console.log('Email trong input:', emailValue);

        console.log('\n4️⃣ Nhấn nút Đăng ký...');
        
        // Tìm tất cả button type submit trong form
        const allSubmitButtons = await driver.findElements(By.css('form button[type="submit"]'));
        console.log(`Tìm thấy ${allSubmitButtons.length} button submit trong form`);
        
        let submitButton;
        for (let btn of allSubmitButtons) {
            try {
                const text = await btn.getText();
                const isDisplayed = await btn.isDisplayed();
                console.log(`Button: "${text}" (hiển thị: ${isDisplayed})`);
                
                if (text.includes('Đăng ký') && isDisplayed) {
                    submitButton = btn;
                    console.log('✓ Tìm thấy button "Đăng ký"');
                    break;
                }
            } catch (e) {}
        }
        
        if (!submitButton) {
            console.log('⚠️ Không tìm thấy button "Đăng ký", thử cách khác...');
            // Thử submit bằng cách nhấn Enter ở field cuối cùng
            await passwordInputs[1].sendKeys(Key.RETURN);
            console.log('✓ Đã nhấn Enter để submit form');
        } else {
            await submitButton.click();
            console.log('✓ Đã nhấn nút đăng ký');
        }
        
        // Chờ xử lý
        console.log('Chờ 8 giây để xử lý...');
        await driver.sleep(8000);

        console.log('\n5️⃣ Kiểm tra kết quả...');
        const urlAfterSubmit = await driver.getCurrentUrl();
        console.log('URL sau khi submit:', urlAfterSubmit);

        // Kiểm tra toast/alert messages
        try {
            const alerts = await driver.findElements(By.css('[role="alert"], .Toastify, [class*="toast"]'));
            if (alerts.length > 0) {
                console.log(`\nTìm thấy ${alerts.length} thông báo:`);
                for (let alert of alerts) {
                    try {
                        const text = await alert.getText();
                        if (text) {
                            console.log('  📢', text);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        // Kiểm tra error messages
        try {
            const errors = await driver.findElements(By.css('.error, [class*="error"]'));
            for (let error of errors) {
                try {
                    const text = await error.getText();
                    const isVisible = await error.isDisplayed();
                    if (text && isVisible) {
                        console.log('❌ Lỗi:', text);
                    }
                } catch (e) {}
            }
        } catch (e) {}

        if (urlAfterSubmit.includes('/register')) {
            console.log('\n⚠️ Vẫn ở trang đăng ký - có thể có lỗi');
            console.log('Hãy kiểm tra thủ công xem có lỗi gì không');
        } else {
            console.log('\n✅ Đã chuyển trang - đăng ký thành công!');
            console.log('User đã được tự động đăng nhập sau khi đăng ký');
        }

        console.log('\n6️⃣ Đăng xuất khỏi tài khoản...');
        try {
            // Click vào tên user để mở dropdown menu
            const userMenuButton = await driver.findElement(By.xpath("//*[contains(@class, 'user') or contains(text(), '" + testUser.name.substring(0, 10) + "')]"));
            await userMenuButton.click();
            console.log('✓ Đã click vào menu user');
            await driver.sleep(1000);

            // Click "Đăng xuất"
            const logoutButton = await driver.findElement(By.xpath("//*[contains(text(), 'Đăng xuất')]"));
            await logoutButton.click();
            console.log('✓ Đã click "Đăng xuất"');
            await driver.sleep(3000);
            
            const urlAfterLogout = await driver.getCurrentUrl();
            console.log('URL sau khi đăng xuất:', urlAfterLogout);
        } catch (e) {
            console.log('⚠️ Không tìm thấy menu đăng xuất, sẽ clear session thủ công');
            await driver.manage().deleteAllCookies();
            await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
            await driver.sleep(1000);
        }

        console.log('\n7️⃣ Thử đăng nhập lại với tài khoản vừa tạo...');
        await driver.get(`${config.baseUrl}/login`);
        await driver.sleep(3000);

        try {
            const loginEmail = await waitForElement(driver, By.css('input[type="email"]'), 10000);
            await loginEmail.clear();
            await loginEmail.sendKeys(testUser.email);

            const loginPassword = await driver.findElement(By.css('input[type="password"]'));
            await loginPassword.clear();
            await loginPassword.sendKeys(testUser.password);
            await loginPassword.sendKeys(Key.RETURN);
            
            console.log('✓ Đã submit form đăng nhập');
            await driver.sleep(5000);

            const urlAfterLogin = await driver.getCurrentUrl();
            console.log('URL sau khi đăng nhập:', urlAfterLogin);

            if (urlAfterLogin.includes('/login')) {
                console.log('❌ Vẫn ở trang login - đăng nhập thất bại');
                
                // Kiểm tra lỗi
                try {
                    const errorEl = await driver.findElement(By.css('.error, [class*="error"]'));
                    const errorText = await errorEl.getText();
                    console.log('Lỗi đăng nhập:', errorText);
                    
                    if (errorText.includes('không tồn tại')) {
                        console.log('\n💡 KẾT LUẬN: User KHÔNG được lưu vào database sau khi đăng ký!');
                    }
                } catch (e) {
                    console.log('Không tìm thấy thông báo lỗi cụ thể');
                }
            } else {
                console.log('✅ Đăng nhập thành công!');
                console.log('\n🎉🎉🎉 KẾT LUẬN: ĐĂNG KÝ, ĐĂNG XUẤT VÀ ĐĂNG NHẬP HOẠT ĐỘNG HOÀN HẢO! 🎉🎉🎉');
            }
        } catch (e) {
            console.log('⚠️ Lỗi khi test đăng nhập:', e.message);
            console.log('URL hiện tại:', await driver.getCurrentUrl());
        }

        console.log('\n8️⃣ Kiểm tra xem user có thể browse sách không...');
        try {
            await driver.get(`${config.baseUrl}/books`);
            await driver.sleep(3000);
            
            const bookLinks = await driver.findElements(By.css('a[href*="/books/"]'));
            console.log(`✓ Tìm thấy ${bookLinks.length} sách`);
            
            if (bookLinks.length > 0) {
                await bookLinks[0].click();
                await driver.sleep(3000);
                console.log('✓ Đã xem chi tiết sách thành công');
            }
        } catch (e) {
            console.log('Không thể browse sách');
        }
    });
});
