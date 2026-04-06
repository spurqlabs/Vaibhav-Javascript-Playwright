const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const logger = require('../utils/logger');

Then('I should see the dashboard', async function () {
  const visible = await this.loginPage.isDashboardVisible();
  expect(visible, 'Dashboard should be visible after login').to.be.true;
  logger.info('Dashboard is visible');
});

When('I logout from the application', async function () {
  logger.info('Logging out from the application');
  await this.loginPage.logout();
});

Then('I should see the login page', async function () {
  const visible = await this.loginPage.isLoginPageVisible();
  expect(visible, 'Login page should be visible after logout').to.be.true;
  logger.info('Login page is visible after logout');
});

When('I enter username {string} and password {string}', async function (username, password) {
  logger.info(`Attempting login with username: "${username}"`);
  await this.loginPage.loginExpectingFailure(username, password);
  logger.info('Login attempt completed');
});

Then('I should see the error message {string}', async function (expectedError) {
  const errorMsg = await this.loginPage.getErrorMessage();
  expect(errorMsg, `Error message should contain "${expectedError}"`).to.include(expectedError);
  logger.info(`Error message verified: ${errorMsg}`);
});
