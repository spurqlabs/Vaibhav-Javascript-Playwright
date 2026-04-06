const BasePage = require('./basePage');
const locators = require('../locators/recruitmentLocators.json');

class RecruitmentPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async goToCandidates() {
    await this.click(locators.nav.recruitmentLink);
    await this.click(locators.nav.candidatesLink);
  }

  async isCandidatesPageVisible() {
    await this.page.locator(locators.candidatesPage.pageHeader).waitFor({ state: 'visible', timeout: 10000 });
    const header = await this.page.locator(locators.candidatesPage.pageHeader).innerText();
    return header.toLowerCase().includes('candidates');
  }

  async clickAddCandidate() {
    await this.click(locators.candidatesPage.addButton);
  }

  async fillAddCandidateForm(candidate) {
    const f = locators.addCandidateForm;
    await this.fill(f.firstName, candidate.firstName);
    if (candidate.middleName) await this.fill(f.middleName, candidate.middleName);
    await this.fill(f.lastName, candidate.lastName);
    await this.selectOption(f.vacancy, candidate.vacancy);
    await this.fill(f.email, candidate.email);
    await this.fill(f.contactNo, candidate.contactNo);
    if (candidate.resumePath) await this.uploadFile(f.resume, candidate.resumePath);
    if (candidate.keywords) await this.fill(f.keywords, candidate.keywords);
    if (candidate.appliedDate) {
      await this.fill(f.appliedDate, candidate.appliedDate);
    }
    if (candidate.notes) await this.fill(f.notes, candidate.notes);
    if (candidate.consent) {
      await this.page.locator(f.consent).setChecked(candidate.consent);
    }
  }

  async saveCandidate() {
    await this.click(locators.addCandidateForm.saveButton);
    // wait for profile header
    await this.page.locator(locators.candidateProfile.nameHeader).waitFor({ state: 'visible', timeout: 10000 });
  }

  async getProfileName() {
    return await this.page.locator(locators.candidateProfile.nameHeader).innerText();
  }

  async shortlistCandidate(notes) {
    await this.click(locators.candidateProfile.shortlistButton);
    await this.fill(locators.shortlist.notes, notes);
    await this.click(locators.shortlist.saveButton);
  }

  async searchCandidate(candidate) {
    const s = locators.candidatesPage;
    if (candidate.name) {
      await this.fill(s.searchCandidateName, `${candidate.firstName} ${candidate.lastName}`);
      // try to handle autosuggest by pressing ArrowDown then Enter if suggestions appear
      await this.page.keyboard.press('ArrowDown').catch(() => {});
      await this.page.keyboard.press('Enter').catch(() => {});
    }
    if (candidate.vacancy) {
      await this.selectOption(s.searchVacancy, candidate.vacancy);
    }
    await this.click(s.searchButton);
    await this.page.locator(s.resultsTable).waitFor({ state: 'visible', timeout: 10000 });
  }

  async resultsContain(candidate) {
    const table = this.page.locator(locators.candidatesPage.resultsTable);
    const text = await table.innerText();
    const fullName = `${candidate.firstName} ${candidate.middleName ? candidate.middleName + ' ' : ''}${candidate.lastName}`.trim();
    return text.includes(fullName) && text.includes(candidate.vacancy);
  }
}

module.exports = RecruitmentPage;

