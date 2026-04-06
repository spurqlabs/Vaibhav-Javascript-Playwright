const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const path = require('path');
const fs = require('fs');
const LoginPage = require('../pages/loginPage');
const RecruitmentPage = require('../pages/recruitmentPage');
const recruitmentData = require('../test-data/candidate.json');
const vacancyData = require('../test-data/vacancy.json');
const config = require('../config/config.json');
const logger = require('../utils/logger');

setDefaultTimeout(60 * 1000);

const screenshotDir = path.join(__dirname, '..', 'screenshots');

BeforeAll(async function () {
  logger.info('========== Test Suite Started ==========');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

Before(async function (scenario) {
  logger.info(`Scenario Started: ${scenario.pickle.name}`);
  const browserType = config.browser || 'chromium';
  const headlessEnv = process.env.HEADLESS;
  const headless = typeof headlessEnv === 'string'
    ? headlessEnv.toLowerCase() === 'true'
    : config.headless;
  const launchOptions = {
    headless,
    slowMo: config.slowMo || 0
  };

  this.browser = await (
    browserType === 'firefox'
      ? firefox.launch(launchOptions)
      : browserType === 'webkit'
        ? webkit.launch(launchOptions)
        : chromium.launch(launchOptions)
  );
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeout || 30000);
  this.loginPage = new LoginPage(this.page);
  this.recruitmentPage = new RecruitmentPage(this.page);

  const ts = Date.now();
  this.candidateData = { ...recruitmentData.candidate, email: `john.doe.${ts}@example.com` };
  this.shortlistData = recruitmentData.shortlist;
  this.searchData = {
    firstName: recruitmentData.candidate.firstName,
    middleName: recruitmentData.candidate.middleName,
    lastName: recruitmentData.candidate.lastName,
    vacancy: recruitmentData.search.vacancy,
    expectedStatus: recruitmentData.search.expectedStatus
  };
  this.vacancyData = { ...vacancyData.vacancy, name: `${vacancyData.vacancy.name} ${ts}` };
  logger.info(`Browser launched: ${browserType} | headless: ${headless}`);
});

After(async function (scenario) {
  const status = scenario.result ? scenario.result.status : 'UNKNOWN';
  logger.info(`Scenario Finished: ${scenario.pickle.name} | Status: ${status}`);

  if (status === 'FAILED' && this.page) {
    try {
      const stepName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
      const screenshotPath = path.join(screenshotDir, `${stepName}.png`);
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.attach(screenshot, 'image/png');
      logger.error(`Screenshot saved: ${screenshotPath}`);
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
    }
  }

  if (this.browser) {
    await this.browser.close();
    logger.info('Browser closed');
  }
});

AfterAll(async function () {
  logger.info('========== Test Suite Completed ==========');
});
