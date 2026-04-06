const BasePage = require('./basePage');
const allLocators = require('../locators/recruitmentLocators.json');
const locators = allLocators.login;
const nav = allLocators.nav;
const logger = require('../utils/logger');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    const config = require('../config/config.json');
    logger.info(`Opening URL: ${config.baseUrl}`);
    await this.goto(config.baseUrl);
  }

  async login(username, password) {
    try {
      await this.fill(locators.username, username);
      await this.fill(locators.password, password);
      await this.click(locators.loginButton);
      await this.page.waitForURL('**/dashboard/**', { timeout: 30000 });
      logger.info('Login successful');
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      throw error;
    }
  }

  async loginExpectingFailure(username, password) {
    await this.fill(locators.username, username);
    await this.fill(locators.password, password);
    await this.click(locators.loginButton);
    await this.page.locator(locators.errorMessage).waitFor({ state: 'visible', timeout: 10000 });
  }

  async getErrorMessage() {
    const el = this.page.locator(locators.errorMessage);
    await el.waitFor({ state: 'visible', timeout: 10000 });
    return (await el.innerText()).trim();
  }

  async isDashboardVisible() {
    const header = this.page.locator(locators.dashboardHeader);
    await header.waitFor({ state: 'visible', timeout: 15000 });
    return await header.isVisible();
  }

  async logout() {
    await this.click(nav.userDropdown);
    await this.page.locator(nav.logoutLink).waitFor({ state: 'visible', timeout: 10000 });
    await this.click(nav.logoutLink);
    await this.page.locator(locators.username).waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Logout successful');
  }

  async isLoginPageVisible() {
    const usernameField = this.page.locator(locators.username);
    await usernameField.waitFor({ state: 'visible', timeout: 15000 });
    return await usernameField.isVisible();
  }
}

module.exports = LoginPage;

