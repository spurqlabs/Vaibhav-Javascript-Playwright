const BasePage = require('./basePage');
const locators = require('../locators/recruitmentLocators.json').login;

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    const config = require('../config/config.json');
    await this.goto(config.baseUrl);
  }

  async login(username, password) {
    await this.fill(locators.username, username);
    await this.fill(locators.password, password);
    await this.click(locators.loginButton);
  }
}

module.exports = LoginPage;

