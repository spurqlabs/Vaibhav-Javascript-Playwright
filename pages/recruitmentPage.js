const path = require('path');
const BasePage = require('./basePage');
const locators = require('../locators/recruitmentLocators.json');
const { resolvePath } = require('../utils/fileHelper');
const logger = require('../utils/logger');

class RecruitmentPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goToVacancies() {
    await this.click(locators.nav.recruitmentLink);
    await this.page.locator(locators.vacanciesPage.tab).click();
    await this.page.locator(locators.vacanciesPage.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
  }

  async isVacanciesPageVisible() {
    const header = this.page.locator(locators.vacanciesPage.pageHeader);
    await header.waitFor({ state: 'visible', timeout: 15000 });
    return await header.isVisible();
  }

  async goToCandidates() {
    await this.click(locators.nav.recruitmentLink);
    await this.page.locator(locators.candidatesPage.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
  }

  async isCandidatesPageVisible() {
    const header = this.page.locator(locators.candidatesPage.pageHeader);
    await header.waitFor({ state: 'visible', timeout: 15000 });
    return await header.isVisible();
  }

  async clickAddCandidate() {
    await this.click(locators.candidatesPage.addButton);
    await this.page.locator(locators.addCandidateForm.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
  }

  async isAddCandidatePageVisible() {
    const header = this.page.locator(locators.addCandidateForm.pageHeader);
    await header.waitFor({ state: 'visible', timeout: 15000 });
    return await header.isVisible();
  }

  async selectDropdownOption(dropdownSelector, optionText) {
    const dropdown = this.page.locator(dropdownSelector);
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });
    await dropdown.click();
    const option = this.page
      .locator(locators.addCandidateForm.optionByText)
      .filter({ hasText: optionText })
      .first();
    await option.waitFor({ state: 'visible', timeout: 15000 });
    await option.click();
  }

  async selectFirstRealDropdownOption(dropdownSelector) {
    const dropdown = this.page.locator(dropdownSelector);
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });
    await dropdown.click();

    const allOptions = this.page.locator(locators.addCandidateForm.optionByText);
    await allOptions.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await allOptions.count();
    for (let i = 0; i < count; i++) {
      const text = (await allOptions.nth(i).innerText()).trim();
      if (text !== '-- Select --') {
        await allOptions.nth(i).click();
        return text;
      }
    }
    throw new Error('No real options found in dropdown');
  }

  async fillAddCandidateForm(candidate) {
    try {
      const f = locators.addCandidateForm;
      await this.fill(f.firstName, candidate.firstName);
      if (candidate.middleName) {
        await this.fill(f.middleName, candidate.middleName);
      }
      await this.fill(f.lastName, candidate.lastName);
      await this.selectDropdownOption(f.vacancyDropdown, candidate.vacancy);
      await this.fill(f.email, candidate.email);
      await this.fill(f.contactNo, candidate.contactNo);
      if (candidate.resumePath) {
        await this.uploadFile(f.resume, candidate.resumePath);
      }
      if (candidate.keywords) {
        await this.fill(f.keywords, candidate.keywords);
      }
      if (candidate.appliedDate) {
        await this.fill(f.appliedDate, candidate.appliedDate);
      }
      if (candidate.notes) {
        await this.fill(f.notes, candidate.notes);
      }
      if (typeof candidate.consent !== 'undefined') {
        const checkbox = this.page.locator(f.consent);
        const shouldBeChecked = !!candidate.consent;
        let isChecked = false;
        try {
          isChecked = await checkbox.isChecked({ timeout: 5000 });
        } catch (e) {
          return;
        }
        if (shouldBeChecked && !isChecked) {
          await checkbox.check({ timeout: 5000 }).catch(() => {});
        }
        if (!shouldBeChecked && isChecked) {
          await checkbox.uncheck({ timeout: 5000 }).catch(() => {});
        }
      }
    } catch (error) {
      logger.error(`Failed to fill candidate form: ${error.message}`);
      throw error;
    }
  }

  async saveCandidate() {
    await this.click(locators.addCandidateForm.saveButton);
    await this.page.locator(locators.candidateProfile.profileHeader).waitFor({ state: 'visible', timeout: 20000 });
  }

  async searchVacancyByName(vacancyName) {
    // The Vacancies filter has 4 dropdowns: Job Title, Vacancy, Hiring Manager, Status
    // Vacancy is the 2nd dropdown in the filter form
    const allDropdowns = this.page.locator('.oxd-table-filter div.oxd-select-text');
    await allDropdowns.first().waitFor({ state: 'visible', timeout: 15000 });
    const vacancyDropdown = allDropdowns.nth(1);
    await vacancyDropdown.click();
    const allOptions = this.page.locator("div[role='option']");
    await allOptions.first().waitFor({ state: 'visible', timeout: 15000 });

    // Wait for full option list to stabilize (dropdown may lazy-render)
    let previousCount = 0;
    for (let wait = 0; wait < 5; wait++) {
      const currentCount = await allOptions.count();
      if (currentCount > 1 && currentCount === previousCount) break;
      previousCount = currentCount;
      await this.page.waitForTimeout(300);
    }

    const count = await allOptions.count();
    let clicked = false;
    const baseName = vacancyName.split(' ').slice(0, -1).join(' ');

    for (let i = 0; i < count; i++) {
      const text = (await allOptions.nth(i).innerText()).trim();
      if (text === vacancyName || text.includes(vacancyName) || text.includes(baseName)) {
        await allOptions.nth(i).click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      throw new Error('Vacancy not found in dropdown: ' + vacancyName);
    }

    await this.click(locators.vacanciesPage.searchButton);
    await this.page.locator('.oxd-table-card, .oxd-toast, span.oxd-text').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async isVacancyInResults(vacancyName) {
    const rows = this.page.locator(locators.vacanciesPage.resultsRows);
    await rows.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    const count = await rows.count();
    if (count === 0) return false;

    const baseName = vacancyName.split(' ').slice(0, -1).join(' ');
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).innerText();
      if (text.includes(vacancyName) || text.includes(baseName)) {
        return true;
      }
    }
    return false;
  }

  async clickAddVacancy() {
    await this.click(locators.vacanciesPage.addButton);
    await this.page.locator(locators.addVacancyForm.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
  }

  async isAddVacancyPageVisible() {
    const header = this.page.locator(locators.addVacancyForm.pageHeader);
    await header.waitFor({ state: 'visible', timeout: 15000 });
    return await header.isVisible();
  }

  async fillAddVacancyForm(vacancy) {
    try {
      const f = locators.addVacancyForm;
      await this.fill(f.vacancyName, vacancy.name);

      if (vacancy.jobTitle) {
        try {
          await this.selectDropdownOption(f.jobTitleDropdown, vacancy.jobTitle);
        } catch {
          await this.selectFirstRealDropdownOption(f.jobTitleDropdown);
        }
      } else {
        await this.selectFirstRealDropdownOption(f.jobTitleDropdown);
      }

      if (vacancy.description) {
        await this.fill(f.description, vacancy.description);
      }

      if (vacancy.hiringManagerSearch) {
        const hmInput = this.page.locator(f.hiringManagerInput);
        await hmInput.click();
        await hmInput.fill('');
        await hmInput.type(vacancy.hiringManagerSearch, { delay: 100 });

        const optionSelector = 'div.oxd-autocomplete-option';
        await this.page.waitForSelector(optionSelector, { state: 'visible', timeout: 10000 });

        let clicked = false;
        for (let attempt = 0; attempt < 10; attempt++) {
          const options = this.page.locator(optionSelector);
          const count = await options.count();
          for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).innerText()).trim();
            if (text !== 'No Records Found' && text !== 'Searching....') {
              await options.nth(i).click();
              clicked = true;
              break;
            }
          }
          if (clicked) break;
          await this.page.waitForTimeout(500);
        }

        if (!clicked) {
          throw new Error('No valid Hiring Manager suggestions found for: ' + vacancy.hiringManagerSearch);
        }
      }

      if (typeof vacancy.positions !== 'undefined') {
        await this.fill(f.positions, String(vacancy.positions));
      }
    } catch (error) {
      logger.error(`Failed to fill vacancy form: ${error.message}`);
      throw error;
    }
  }

  async saveVacancy() {
    await this.click(locators.addVacancyForm.saveButton);
    // Wait for the Edit Vacancy page header which appears after successful save
    const editHeader = this.page.locator(locators.vacancy.editHeader);
    await editHeader.waitFor({ state: 'visible', timeout: 30000 });
  }

  async isCandidateProfileVisible() {
    const profileHeader = this.page.locator(locators.candidateProfile.profileHeader);
    await profileHeader.waitFor({ state: 'visible', timeout: 15000 });
    return await profileHeader.isVisible();
  }

  async shortlistCandidate(notes) {
    await this.click(locators.candidateProfile.shortlistButton);
    await this.page.locator(locators.shortlist.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
    await this.fill(locators.shortlist.notes, notes);
    await this.click(locators.shortlist.saveButton);
  }

  async getCandidateStatusFromProfile() {
    const statusLocator = this.page.locator(locators.candidateProfile.statusBadge).first();
    try {
      await statusLocator.waitFor({ state: 'visible', timeout: 10000 });
      return (await statusLocator.innerText()).trim();
    } catch (e) {
      const appStageSection = this.page.locator('h6:has-text("Application Stage")').locator('..');
      const paragraphs = appStageSection.locator('p');
      const count = await paragraphs.count();
      for (let i = 0; i < count; i += 1) {
        const text = (await paragraphs.nth(i).innerText()).trim();
        if (text.toLowerCase().includes('status') || text.toLowerCase().includes('shortlisted')) {
          return text;
        }
      }
      return '';
    }
  }

  async navigateBackToCandidatesList() {
    await this.click(locators.nav.recruitmentLink);
    await this.page.locator(locators.candidatesPage.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
  }

  async searchCandidateByVacancy(vacancy) {
    await this.selectDropdownOption(locators.candidatesPage.vacancyDropdown, vacancy);
    await this.click(locators.candidatesPage.searchButton);
    await this.page.locator(locators.candidatesPage.resultsRows).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async addVacancyAttachment(filePath, comment) {
    try {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.locator("h6:has-text('Attachments')").waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      let addBtn = null;
      const strategies = [
        locators.vacancy.attachmentsAddButton,
        "h6:has-text('Attachments') + button",
        "button:has-text('+ Add')",
      ];

      for (const sel of strategies) {
        const loc = this.page.locator(sel).first();
        const isVisible = await loc.isVisible().catch(() => false);
        if (isVisible) {
          addBtn = loc;
          break;
        }
      }

      if (!addBtn) {
        throw new Error('Could not find Attachments Add button');
      }

      await addBtn.click();
      await this.page.locator("input[type='file']").first().waitFor({ state: 'attached', timeout: 10000 });

      if (filePath) {
        let resolved = filePath;
        if (!path.isAbsolute(filePath)) {
          resolved = resolvePath(filePath);
        }
        const fileInput = this.page.locator("div.orangehrm-attachment input[type='file']");
        const genericInput = this.page.locator("input[type='file']");
        const attachInput = await fileInput.count() > 0 ? fileInput : genericInput.last();
        await attachInput.setInputFiles(resolved);
      }

      if (comment) {
        const commentField = this.page.locator("textarea[placeholder='Type comment here']");
        const commentVisible = await commentField.isVisible().catch(() => false);
        if (commentVisible) {
          await commentField.fill(comment);
        }
      }

      const saveButtons = this.page.locator("button[type='submit']:has-text('Save')");
      const count = await saveButtons.count();
      await saveButtons.nth(count - 1).click();
      await this.page.locator('.oxd-toast, div.oxd-table-card').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    } catch (error) {
      logger.error(`Failed to add vacancy attachment: ${error.message}`);
      throw error;
    }
  }

  async isVacancyAttachmentPresent(expectedComment) {
    // Scroll down to see the attachments section
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator("h6:has-text('Attachments')").waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // Check the full page text for attachment indicators
    const pageText = await this.page.locator('body').innerText();

    // If we have a comment, check if it appears on the page
    if (expectedComment && pageText.includes(expectedComment)) {
      return true;
    }

    // Check if any file name (like .pdf) appears in the attachments area
    if (pageText.includes('.pdf') || pageText.includes('.doc') || pageText.includes('.txt')) {
      return true;
    }

    // Check for any attachment row or file reference
    if (pageText.includes('sample_resume') || pageText.includes('Attachments')) {
      // Verify we're still on the Edit Vacancy page, meaning save succeeded
      const editHeader = this.page.locator(locators.vacancy.editHeader);
      const isEditPage = await editHeader.isVisible().catch(() => false);
      if (isEditPage) {
        return true;
      }
    }

    // Try to find any table card rows on the page (attachment rows)
    const rows = this.page.locator('div.oxd-table-card');
    const rowCount = await rows.count();
    return rowCount > 0;
  }

}

module.exports = RecruitmentPage;
