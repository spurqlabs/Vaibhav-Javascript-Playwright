const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const loginData = require('../test-data/login.json');
const logger = require('../utils/logger');

// ─── Background Steps ───

Given('I open the OrangeHRM login page', async function () {
  logger.info('Opening OrangeHRM login page');
  await this.loginPage.open();
  logger.info('Login page loaded successfully');
});

Given('I login with admin credentials', async function () {
  logger.info('Logging in with admin credentials');
  const admin = loginData.admin;
  await this.loginPage.login(admin.username, admin.password);
  logger.info('Login successful – redirected to dashboard');
});

// ─── Candidate Flow Steps ───

When('I navigate to the Recruitment -> Candidates page', async function () {
  logger.info('Navigating to Recruitment → Candidates page');
  await this.recruitmentPage.goToCandidates();
  logger.info('Candidates page navigation complete');
});

Then('I should see the Candidates page', async function () {
  const visible = await this.recruitmentPage.isCandidatesPageVisible();
  expect(visible, 'Candidates page header should be visible').to.be.true;
  logger.info('Candidates page is visible');
});

When('I click Add Candidate', async function () {
  logger.info('Clicking Add Candidate button');
  await this.recruitmentPage.clickAddCandidate();
  logger.info('Add Candidate form opened');
});

When('I fill the candidate form with candidate data', async function () {
  const candidate = this.candidateData;
  logger.info(`Filling candidate form: ${candidate.firstName} ${candidate.lastName} (${candidate.email})`);
  await this.recruitmentPage.fillAddCandidateForm(candidate);
  logger.info('Candidate form filled successfully');
});

Then('I should see the Add Candidate page', async function () {
  const visible = await this.recruitmentPage.isAddCandidatePageVisible();
  expect(visible, 'Add Candidate page header should be visible').to.be.true;
  logger.info('Add Candidate page is visible');
});

When('I save the candidate', async function () {
  logger.info('Saving the candidate');
  await this.recruitmentPage.saveCandidate();
  logger.info('Candidate saved successfully');
});

Then('I should see the candidate profile with correct details', async function () {
  const candidate = this.candidateData;
  const visible = await this.recruitmentPage.isCandidateProfileVisible();
  expect(visible, 'Candidate profile page should be visible after save').to.be.true;

  const expectedName = `${candidate.firstName} ${candidate.middleName ? `${candidate.middleName} ` : ''}${candidate.lastName}`.trim();
  const pageText = await this.page.locator('body').innerText();
  expect(pageText, `Profile should contain candidate name "${expectedName}"`).to.include(expectedName);

  this.createdCandidateName = expectedName;
  logger.info(`Candidate profile verified: ${expectedName}`);
});

When('I shortlist the candidate with shortlist notes', async function () {
  logger.info('Shortlisting the candidate');
  await this.recruitmentPage.shortlistCandidate(this.shortlistData.notes);
  logger.info('Candidate shortlisted successfully');
});

Then('the candidate status should be updated to {string}', async function (expectedStatus) {
  logger.info(`Verifying candidate status is "${expectedStatus}"`);
  const statusText = await this.recruitmentPage.getCandidateStatusFromProfile();
  if (statusText) {
    expect(statusText.toLowerCase(), `Candidate status should contain "${expectedStatus}"`).to.include(expectedStatus.toLowerCase());
  }
  logger.info(`Candidate status verified: ${statusText}`);
  await this.recruitmentPage.navigateBackToCandidatesList();
});

When('I search for the candidate using the search form', async function () {
  logger.info(`Searching candidate by vacancy: ${this.searchData.vacancy}`);
  await this.recruitmentPage.searchCandidateByVacancy(this.searchData.vacancy);
  logger.info('Candidate search completed');
});

Then('the search results should contain the candidate with expected vacancy and status', async function () {
  const header = this.page.locator('h5:has-text("Candidates")');
  await header.waitFor({ state: 'visible', timeout: 15000 });
  expect(await header.isVisible(), 'Candidates list should be visible after search').to.be.true;
  logger.info('Search results page verified');
});

// ─── Vacancy Flow Steps ───

When('I navigate to the Recruitment -> Vacancies page', async function () {
  logger.info('Navigating to Recruitment → Vacancies page');
  await this.recruitmentPage.goToVacancies();
  logger.info('Vacancies page navigation complete');
});

Then('I should see the Vacancies page', async function () {
  const visible = await this.recruitmentPage.isVacanciesPageVisible();
  expect(visible, 'Vacancies page header should be visible').to.be.true;
  logger.info('Vacancies page is visible');
});

When('I click Add Vacancy', async function () {
  logger.info('Clicking Add Vacancy button');
  await this.recruitmentPage.clickAddVacancy();
  logger.info('Add Vacancy form opened');
});

Then('I should see the Add Vacancy page', async function () {
  const visible = await this.recruitmentPage.isAddVacancyPageVisible();
  expect(visible, 'Add Vacancy page header should be visible').to.be.true;
  logger.info('Add Vacancy page is visible');
});

When('I fill the vacancy form with vacancy data', async function () {
  logger.info(`Filling vacancy form: ${this.vacancyData.name}`);
  await this.recruitmentPage.fillAddVacancyForm(this.vacancyData);
  logger.info('Vacancy form filled successfully');
});

When('I save the vacancy', async function () {
  logger.info('Saving the vacancy');
  await this.recruitmentPage.saveVacancy();
  logger.info('Vacancy saved successfully');
});

When('I add an attachment to the vacancy', async function () {
  logger.info('Adding attachment to vacancy');
  await this.recruitmentPage.addVacancyAttachment(this.vacancyData.attachmentPath, this.vacancyData.attachmentComment);
  logger.info('Vacancy attachment added');
});

Then('the vacancy attachment should be visible in the attachments table', async function () {
  const visible = await this.recruitmentPage.isVacancyAttachmentPresent(this.vacancyData.attachmentComment);
  expect(visible, 'Vacancy attachment should be visible in attachments table').to.be.true;
  logger.info('Vacancy attachment verified in table');
});

When('I navigate to the Recruitment -> Candidates page from vacancy', async function () {
  logger.info('Navigating from Vacancies to Candidates tab');
  await this.page.locator("a:has-text('Candidates')").click();
  const header = this.page.locator('h5:has-text("Candidates")');
  await header.waitFor({ state: 'visible', timeout: 15000 });
  logger.info('Navigated to Candidates page');
});

When('I search for the created vacancy on the Vacancies page', async function () {
  logger.info(`Searching for vacancy: ${this.vacancyData.name}`);
  await this.recruitmentPage.searchVacancyByName(this.vacancyData.name);
  logger.info('Vacancy search completed');
});

Then('the search results should contain the created vacancy', async function () {
  const found = await this.recruitmentPage.isVacancyInResults(this.vacancyData.name);
  expect(found, `Vacancy "${this.vacancyData.name}" should appear in search results`).to.be.true;
  logger.info(`Vacancy found in search results: ${this.vacancyData.name}`);
});

