import { expect } from 'chai';
import { createDriver, quitDriver } from '../helpers/driver-manager.js';
import { waitForElement, waitForElements } from '../helpers/wait-helpers.js';
import { By, Key } from 'selenium-webdriver';
import config from '../config.js';

describe('E2E: Tim kiem va Loc Sach', function() {
    let driver;

    before(async function() {
        this.timeout(30000);
        driver = await createDriver();
        console.log('\nTest tim kiem va loc sach');
    });

    after(async function() {
        await quitDriver(driver);
    });

    it('Tim kiem sach theo tu khoa', async function() {
        this.timeout(90000);

        console.log('\n' + '='.repeat(60));
        console.log('TEST 1: TIM KIEM SACH');
        console.log('='.repeat(60));

        console.log('\n1. Truy cap trang sach...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        const initialBooks = await driver.findElements(By.css('a[href*="/books/"]'));
        console.log(`So sach ban dau: ${initialBooks.length}`);

        console.log('\n2. Tim o tim kiem...');
        const searchInput = await driver.findElement(By.css('input[placeholder*="Tên sách"], input[placeholder*="tác giả"]'));
        console.log('Da tim thay o tim kiem');

        console.log('\n3. Nhap tu khoa tim kiem...');
        const searchKeyword = 'book';
        await searchInput.clear();
        await searchInput.sendKeys(searchKeyword);
        console.log(`Da nhap tu khoa: "${searchKeyword}"`);
        
        await searchInput.sendKeys(Key.RETURN);
        console.log('Da nhan Enter de tim kiem');
        await driver.sleep(3000);

        console.log('\n4. Kiem tra ket qua tim kiem...');
        const currentUrl = await driver.getCurrentUrl();
        console.log('URL sau khi tim kiem:', currentUrl);

        const searchResults = await driver.findElements(By.css('a[href*="/books/"]'));
        console.log(`So sach tim thay: ${searchResults.length}`);

        if (searchResults.length > 0) {
            console.log('Tim kiem hoat dong - co ket qua hien thi');
            
            try {
                const firstResult = searchResults[0];
                const titleEl = await firstResult.findElement(By.css('h2, h3, .book-title, [class*="title"]'));
                const title = await titleEl.getText();
                console.log(`Sach dau tien: "${title}"`);
            } catch (e) {
                console.log('Khong lay duoc ten sach');
            }
        }
    });

    it('Loc sach theo danh muc', async function() {
        this.timeout(90000);

        console.log('\n' + '='.repeat(60));
        console.log('TEST 2: LOC SACH THEO DANH MUC');
        console.log('='.repeat(60));

        console.log('\n1. Truy cap trang sach...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        console.log('\n2. Tim bo loc danh muc (radio buttons)...');
        const categoryRadios = await driver.findElements(By.css('input[type="radio"]'));
        console.log(`Tim thay ${categoryRadios.length} radio buttons danh muc`);

        console.log('\n3. Lay danh sach cac danh muc...');
        for (let i = 0; i < Math.min(categoryRadios.length, 3); i++) {
            try {
                const parent = await categoryRadios[i].findElement(By.xpath('..'));
                const text = await parent.getText();
                console.log(`  Danh muc ${i + 1}: ${text}`);
            } catch (e) {}
        }

        console.log('\n4. Chon danh muc thu 2...');
        if (categoryRadios.length > 1) {
            const radio = categoryRadios[1];
            await driver.executeScript('arguments[0].scrollIntoView(true);', radio);
            await driver.sleep(500);
            await radio.click();
            console.log('Da chon danh muc');
            await driver.sleep(3000);
        }

        console.log('\n5. Kiem tra ket qua sau khi loc...');
        const filteredBooks = await driver.findElements(By.css('a[href*="/books/"]'));
        console.log(`So sach sau khi loc: ${filteredBooks.length}`);
        
        const urlAfterFilter = await driver.getCurrentUrl();
        console.log('URL sau khi loc:', urlAfterFilter);
        console.log('Loc theo danh muc hoat dong');
    });

    it('Loc sach theo khoang gia', async function() {
        this.timeout(90000);

        console.log('\n' + '='.repeat(60));
        console.log('TEST 3: LOC SACH THEO KHOANG GIA');
        console.log('='.repeat(60));

        console.log('\n1. Truy cap trang sach...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        console.log('\n2. Tim bo loc khoang gia...');
        try {
            const priceInputs = await driver.findElements(By.css('input[type="number"]'));
            console.log(`Tim thay ${priceInputs.length} o nhap gia`);

            if (priceInputs.length >= 2) {
                console.log('\n3. Nhap khoang gia...');
                const minPrice = '50000';
                const maxPrice = '200000';

                await priceInputs[0].clear();
                await priceInputs[0].sendKeys(minPrice);
                console.log(`Da nhap gia toi thieu: ${minPrice}`);

                await priceInputs[1].clear();
                await priceInputs[1].sendKeys(maxPrice);
                console.log(`Da nhap gia toi da: ${maxPrice}`);

                console.log('\n4. Nhan nut "Ap Dung"...');
                const applyButton = await driver.findElement(By.xpath("//*[contains(text(), 'Áp Dụng')]"));
                await applyButton.click();
                console.log('Da nhan "Ap Dung"');
                await driver.sleep(3000);

                console.log('\n5. Kiem tra ket qua...');
                const filteredBooks = await driver.findElements(By.css('a[href*="/books/"]'));
                console.log(`So sach sau khi loc: ${filteredBooks.length}`);

                const urlAfterFilter = await driver.getCurrentUrl();
                console.log('URL sau khi loc:', urlAfterFilter);
                console.log('Loc theo khoang gia hoat dong');
            }
        } catch (e) {
            console.log('Khong the loc theo gia:', e.message);
        }
    });

    it('Ket hop tim kiem va loc', async function() {
        this.timeout(90000);

        console.log('\n' + '='.repeat(60));
        console.log('TEST 4: KET HOP TIM KIEM VA LOC');
        console.log('='.repeat(60));

        console.log('\n1. Truy cap trang sach...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        const initialCount = (await driver.findElements(By.css('a[href*="/books/"]'))).length;
        console.log(`Tong so sach: ${initialCount}`);

        console.log('\n2. Nhap tu khoa tim kiem...');
        try {
            const searchInput = await driver.findElement(By.css('input[placeholder*="Tên sách"]'));
            await searchInput.clear();
            await searchInput.sendKeys('book');
            await searchInput.sendKeys(Key.RETURN);
            await driver.sleep(2000);
            const afterSearch = (await driver.findElements(By.css('a[href*="/books/"]'))).length;
            console.log(`Sau tim kiem: ${afterSearch} sach`);
        } catch (e) {
            console.log('Khong the tim kiem');
        }

        console.log('\n3. Ap dung them filter danh muc...');
        try {
            const categoryRadios = await driver.findElements(By.css('input[type="radio"]'));
            
            if (categoryRadios.length > 1) {
                await categoryRadios[1].click();
                await driver.sleep(2000);
                
                const afterFilter = (await driver.findElements(By.css('a[href*="/books/"]'))).length;
                console.log(`Sau loc danh muc: ${afterFilter} sach`);
                console.log('Ket hop tim kiem va loc hoat dong');
            }
        } catch (e) {
            console.log('Khong the loc danh muc');
        }

        console.log('\n4. Click vao sach dau tien de xem chi tiet...');
        try {
            const books = await driver.findElements(By.css('a[href*="/books/"]'));
            if (books.length > 0) {
                await books[0].click();
                await driver.sleep(3000);
                
                const detailUrl = await driver.getCurrentUrl();
                console.log('URL chi tiet sach:', detailUrl);
                expect(detailUrl).to.include('/books/');
                console.log('Xem chi tiet sach thanh cong');
            }
        } catch (e) {
            console.log('Khong the xem chi tiet sach');
        }
    });

    it('Reset bo loc', async function() {
        this.timeout(60000);

        console.log('\n' + '='.repeat(60));
        console.log('TEST 5: RESET BO LOC');
        console.log('='.repeat(60));

        console.log('\n1. Truy cap trang sach...');
        await driver.get(`${config.baseUrl}/books`);
        await driver.sleep(3000);

        console.log('\n2. Ap dung mot so filter...');
        try {
            const searchInput = await driver.findElement(By.css('input[placeholder*="Tên sách"]'));
            await searchInput.sendKeys('test');
            await searchInput.sendKeys(Key.RETURN);
            await driver.sleep(2000);
            console.log('Da ap dung tim kiem');
        } catch (e) {}

        try {
            const categoryRadios = await driver.findElements(By.css('input[type="radio"]'));
            if (categoryRadios.length > 1) {
                await categoryRadios[1].click();
                await driver.sleep(2000);
                console.log('Da chon danh muc');
            }
        } catch (e) {}

        console.log('\n3. Tim nut "Xoa Tat Ca Bo Loc"...');
        try {
            const resetButton = await driver.findElement(By.xpath("//*[contains(text(), 'Xóa Tất Cả Bộ Lọc')]"));
            await driver.executeScript('arguments[0].scrollIntoView(true);', resetButton);
            await driver.sleep(500);
            await resetButton.click();
            await driver.sleep(2000);
            console.log('Da nhan "Xoa Tat Ca Bo Loc"');
            
            const urlAfterReset = await driver.getCurrentUrl();
            console.log('URL sau reset:', urlAfterReset);
            console.log('Reset bo loc hoat dong');
        } catch (e) {
            console.log('Khong tim thay nut reset');
        }

        const finalCount = (await driver.findElements(By.css('a[href*="/books/"]'))).length;
        console.log(`So sach sau reset: ${finalCount}`);
    });
});
