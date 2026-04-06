const { expect } = require('chai');
const path = require('path');
const { resolvePath } = require('../utils/fileHelper');

class BasePage {
  constructor(page, locators) {
    this.page = page;
    this.locators = locators;
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async click(selector) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selector).click();
  }

  async fill(selector, value) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector, value) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(selector).selectOption({ label: value });
  }

  async uploadFile(selector, filePath) {
    const input = this.page.locator(selector);
    let resolved = filePath;
    try {
      if (!path.isAbsolute(filePath)) {
        resolved = resolvePath(filePath);
      }
    } catch (e) {
      // fallback to original
      resolved = filePath;
    }
    await input.setInputFiles(resolved);
  }

  async expectText(selector, expected) {
    const text = await this.page.locator(selector).innerText();
    expect(text).to.include(expected);
  }
}

module.exports = BasePage;
