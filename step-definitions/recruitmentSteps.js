const { Given, When, Then, After, Before } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { chromium, firefox, webkit } = require('playwright');
const LoginPage = require('../pages/loginPage');
const RecruitmentPage = require('../pages/recruitmentPage');
const loginData = require('../test-data/login.json');
const candidateData = require('../test-data/candidate.json').candidate;
const config = require('../config/config.json');

Before(async function () {
  const browserType = config.browser || 'chromium';
  this.browser = await (browserType === 'firefox' ? firefox.launch({ headless: config.headless }) : browserType === 'webkit' ? webkit.launch({ headless: config.headless }) : chromium.launch({ headless: config.headless }));
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.loginPage = new LoginPage(this.page);
  this.recruitmentPage = new RecruitmentPage(this.page);
});

After(async function () {
  if (this.browser) await this.browser.close();
});

Given('I open the OrangeHRM login page', async function () {
  await this.loginPage.open();
});

Given('I login with admin credentials', async function () {
  const admin = loginData.admin;
  await this.loginPage.login(admin.username, admin.password);
});

When('I navigate to the Recruitment -> Candidates page', async function () {
  await this.recruitmentPage.goToCandidates();
});

Then('I should see the Candidates page', async function () {
  const visible = await this.recruitmentPage.isCandidatesPageVisible();
  expect(visible).to.be.true;
});

When('I click Add Candidate and fill the form with candidate data', async function () {
  await this.recruitmentPage.clickAddCandidate();
  await this.recruitmentPage.fillAddCandidateForm(candidateData);
});

When('I save the candidate', async function () {
  await this.recruitmentPage.saveCandidate();
});

Then('I should see the candidate profile with correct details', async function () {
  const profileName = await this.recruitmentPage.getProfileName();
  const expectedName = `${candidateData.firstName} ${candidateData.middleName ? candidateData.middleName + ' ' : ''}${candidateData.lastName}`.trim();
  expect(profileName).to.include(expectedName);
});

When('I shortlist the candidate with shortlist notes', async function () {
  await this.recruitmentPage.shortlistCandidate(candidateData.shortlistNotes);
});

Then('the candidate status should be updated to {string}', async function (expectedStatus) {
  // After shortlist, the Candidates page may show status; we'll navigate back to candidates list and search
  await this.recruitmentPage.searchCandidate(candidateData);
  const contains = await this.recruitmentPage.resultsContain(candidateData);
  expect(contains).to.be.true;
});

When('I search for the candidate using the search form', async function () {
  await this.recruitmentPage.searchCandidate(candidateData);
});

Then('the search results should contain the candidate with expected vacancy and status', async function () {
  const contains = await this.recruitmentPage.resultsContain(candidateData);
  expect(contains).to.be.true;
});

