# Selenium Test Suite for Bookstore Project

This directory contains automated Selenium tests for the Bookstore application using **JavaScript, Selenium WebDriver, and Mocha**.

## 📁 Project Structure

```
selenium-tests/
├── config.js                # Configuration settings
├── package.json             # Node.js dependencies
├── .mocharc.json           # Mocha configuration
├── Dockerfile              # Docker image for tests
├── page-objects/           # Page Object Model classes
│   ├── LoginPage.js
│   └── HomePage.js
├── tests/                  # Test cases
│   ├── login.spec.js
│   └── home.spec.js
├── helpers/                # Utility functions
│   ├── driver-manager.js
│   └── wait-helpers.js
└── reports/               # Test reports and screenshots
```

## 🚀 Quick Start

### Running with Docker Compose (Recommended)

1. **Run all tests with Docker Compose:**
   ```bash
   docker compose -f docker-compose.ui-test.yml up --build --abort-on-container-exit
   ```

2. **View test reports:**
   - HTML report: `selenium-tests/reports/test-report.html`
   - Screenshots (on failure): `selenium-tests/reports/screenshots/`

### Running Locally

1. **Install dependencies:**
   ```bash
   cd selenium-tests
   npm install
   ```

2. **Set environment variables:**
   ```bash
   # Windows PowerShell
   $env:BASE_URL="http://localhost:3000"
   $env:ADMIN_URL="http://localhost:3001"
   $env:API_URL="http://localhost:5000/api"
   
   # Linux/Mac
   export BASE_URL=http://localhost:3000
   export ADMIN_URL=http://localhost:3001
   export API_URL=http://localhost:5000/api
   ```

3. **Run tests:**
   ```bash
   # Run all tests
   npm test

   # Run specific test file
   npm run test:login
   npm run test:home

   # Run in parallel (faster)
   npm run test:parallel
   ```

## 🧪 Test Cases

### Login Tests (`login.spec.js`)
- ✅ Customer login with valid credentials
- ✅ Customer login with invalid email
- ✅ Customer login with wrong password
- ✅ Customer login with empty fields
- ✅ Admin login with valid credentials
- ✅ Admin login with invalid credentials

### Home Page Tests (`home.spec.js`)
- ✅ Home page loads successfully
- ✅ Search functionality exists
- ✅ Navigation to login page
- ✅ Books display on homepage

## ⚙️ Configuration

Edit `config.js` to customize:

```javascript
export default {
    // URLs
    baseUrl: 'http://frontend:3000',
    adminUrl: 'http://frontend:3001',
    apiUrl: 'http://backend:5000/api',

    // Timeouts
    defaultTimeout: 10000,
    pageLoadTimeout: 30000,

    // Browser Settings
    headless: true,  // Set to false to see browser
    windowSize: { width: 1920, height: 1080 },

    // Test Credentials
    testUser: {
        email: 'testuser@example.com',
        password: 'Test@123456',
        name: 'Test User'
    },
    
    admin: {
        email: 'admin@bookstore.com',
        password: 'Admin@123456'
    }
};
```

## 📊 Test Reports

Mocha with Mochawesome generates beautiful HTML reports:

```bash
# Reports are saved to
selenium-tests/reports/test-report.html

# Screenshots on failure
selenium-tests/reports/screenshots/FAILED_*.png
```

## 🔧 Troubleshooting

### Tests fail to connect to services
- Ensure all services are running: `docker compose -f docker-compose.ui-test.yml ps`
- Check backend health: `curl http://localhost:5001/api/health`
- Check frontend availability: `curl http://localhost:3002`

### Chrome/ChromeDriver issues
- The Dockerfile automatically installs compatible Chrome and ChromeDriver versions
- For local testing, ensure Chrome is installed
- ChromeDriver is managed automatically by selenium-webdriver

### Screenshots not being saved
- Check that `screenshotOnFailure: true` in `config.js`
- Ensure `reports/screenshots/` directory exists

## 📝 Writing New Tests

1. **Create a Page Object** (if needed) in `page-objects/`:
   ```javascript
   import { By } from 'selenium-webdriver';
   
   export class MyPage {
       constructor(driver) {
           this.driver = driver;
           this.myElement = By.id('my-element');
       }
       
       async clickElement() {
           const element = await this.driver.findElement(this.myElement);
           await element.click();
       }
   }
   ```

2. **Create a Test** in `tests/`:
   ```javascript
   import { expect } from 'chai';
   import { createDriver } from '../helpers/driver-manager.js';
   import { MyPage } from '../page-objects/MyPage.js';
   
   describe('My Feature Tests', function() {
       let driver, myPage;
       
       beforeEach(async function() {
           driver = await createDriver();
           myPage = new MyPage(driver);
       });
       
       afterEach(async function() {
           await driver.quit();
       });
       
       it('should do something', async function() {
           await myPage.clickElement();
           expect(true).to.be.true;
       });
   });
   ```

## 🐳 Docker Commands

```bash
# Build and run tests
docker compose -f docker-compose.ui-test.yml up --build

# Run tests without rebuilding
docker compose -f docker-compose.ui-test.yml up

# Stop and remove containers
docker compose -f docker-compose.ui-test.yml down

# View logs
docker compose -f docker-compose.ui-test.yml logs selenium-tests

# Run specific test file
docker compose -f docker-compose.ui-test.yml run selenium-tests npm run test:login
```

## 📚 Additional Resources

- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/webdriver/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Page Object Model Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## 🤝 Contributing

When adding new tests:
1. Follow the Page Object Model pattern
2. Use async/await for all Selenium operations
3. Ensure tests are independent and can run in any order
4. Add meaningful assertions with clear error messages
5. Update this README if adding new test categories

## 🎯 Key Features

✅ **JavaScript/Node.js** - Consistent with your project stack  
✅ **Mocha + Chai** - Popular testing framework and assertion library  
✅ **Page Object Model** - Maintainable and reusable code  
✅ **Automatic Screenshots** - On test failure  
✅ **HTML Reports** - Beautiful Mochawesome reports  
✅ **Docker Support** - Containerized testing environment  
✅ **Headless Mode** - Fast execution in CI/CD  
✅ **ES6 Modules** - Modern JavaScript syntax


## 📁 Project Structure

```
selenium-tests/
├── config.py                 # Configuration settings
├── conftest.py              # Pytest fixtures and hooks
├── pytest.ini               # Pytest configuration
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker image for tests
├── page_objects/           # Page Object Model classes
│   ├── __init__.py
│   ├── login_page.py
│   └── home_page.py
├── tests/                  # Test cases
│   ├── __init__.py
│   ├── test_login.py
│   └── test_home.py
├── utils/                  # Utility functions
│   ├── __init__.py
│   ├── driver_manager.py
│   └── wait_helpers.py
└── reports/               # Test reports and screenshots
```

## 🚀 Quick Start

### Running with Docker Compose (Recommended)

1. **Run all tests with Docker Compose:**
   ```bash
   docker compose -f docker-compose.ui-test.yml up --build --abort-on-container-exit
   ```

2. **View test reports:**
   - HTML report: `selenium-tests/reports/report.html`
   - Screenshots (on failure): `selenium-tests/reports/screenshots/`

### Running Locally

1. **Install dependencies:**
   ```bash
   cd selenium-tests
   pip install -r requirements.txt
   ```

2. **Set environment variables:**
   ```bash
   export BASE_URL=http://localhost:3000
   export ADMIN_URL=http://localhost:3001
   export API_URL=http://localhost:5000/api
   ```

3. **Run tests:**
   ```bash
   # Run all tests
   pytest

   # Run specific test file
   pytest tests/test_login.py

   # Run with specific marker
   pytest -m smoke

   # Run in parallel
   pytest -n auto
   ```

## 🧪 Test Cases

### Login Tests (`test_login.py`)
- ✅ Customer login with valid credentials
- ✅ Customer login with invalid email
- ✅ Customer login with wrong password
- ✅ Customer login with empty fields
- ✅ Admin login with valid credentials
- ✅ Admin login with invalid credentials

### Home Page Tests (`test_home.py`)
- ✅ Home page loads successfully
- ✅ Search functionality exists
- ✅ Navigation to login page
- ✅ Books display on homepage

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# URLs
BASE_URL = "http://frontend:3000"
ADMIN_URL = "http://frontend:3001"
API_URL = "http://backend:5000/api"

# Timeouts
DEFAULT_TIMEOUT = 10
PAGE_LOAD_TIMEOUT = 30

# Browser Settings
HEADLESS = True  # Set to False to see browser
WINDOW_SIZE = "1920,1080"

# Test Credentials
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "Test@123456"
ADMIN_EMAIL = "admin@bookstore.com"
ADMIN_PASSWORD = "Admin@123456"
```

## 📊 Test Reports

Pytest generates HTML reports automatically:

```bash
# Reports are saved to
selenium-tests/reports/report.html

# Screenshots on failure
selenium-tests/reports/screenshots/FAILED_*.png
```

## 🎯 Pytest Markers

Use markers to run specific test groups:

```bash
# Run only smoke tests
pytest -m smoke

# Run only login tests
pytest -m login

# Run only admin tests
pytest -m admin

# Exclude slow tests
pytest -m "not slow"
```

## 🔧 Troubleshooting

### Tests fail to connect to services
- Ensure all services are running: `docker compose -f docker-compose.ui-test.yml ps`
- Check backend health: `curl http://localhost:5001/api/health`
- Check frontend availability: `curl http://localhost:3002`

### Chrome/ChromeDriver issues
- The Dockerfile automatically installs compatible Chrome and ChromeDriver versions
- For local testing, ensure Chrome is installed

### Screenshots not being saved
- Check that `SCREENSHOT_ON_FAILURE=True` in `config.py`
- Ensure `reports/screenshots/` directory exists

## 📝 Writing New Tests

1. **Create a Page Object** (if needed) in `page_objects/`:
   ```python
   from selenium.webdriver.common.by import By
   
   class MyPage:
       ELEMENT = (By.ID, "my-element")
       
       def __init__(self, driver):
           self.driver = driver
   ```

2. **Create a Test** in `tests/`:
   ```python
   from conftest import BaseTest
   from page_objects.my_page import MyPage
   
   class TestMyFeature(BaseTest):
       def test_something(self):
           page = MyPage(self.driver)
           # Your test code here
           assert True
   ```

## 🐳 Docker Commands

```bash
# Build and run tests
docker compose -f docker-compose.ui-test.yml up --build

# Run tests without rebuilding
docker compose -f docker-compose.ui-test.yml up

# Stop and remove containers
docker compose -f docker-compose.ui-test.yml down

# View logs
docker compose -f docker-compose.ui-test.yml logs selenium-tests

# Run specific test file
docker compose -f docker-compose.ui-test.yml run selenium-tests pytest tests/test_login.py
```

## 📚 Additional Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Page Object Model Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## 🤝 Contributing

When adding new tests:
1. Follow the Page Object Model pattern
2. Add appropriate markers to tests
3. Ensure tests are independent and can run in any order
4. Add meaningful assertions and error messages
5. Update this README if adding new test categories
