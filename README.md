# OrangeHRM Recruitment — BDD Automation Framework

A complete end-to-end **BDD (Behavior-Driven Development) automation framework** built for the OrangeHRM Recruitment module using **JavaScript**, **Playwright**, and **Cucumber.js** with the **Page Object Model (POM)** design pattern.

> **Application Under Test:** [OrangeHRM Open Source Demo v5.8](https://opensource-demo.orangehrmlive.com/)

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Framework Architecture](#framework-architecture)
3. [Project Structure](#project-structure)
4. [Detailed Layer-by-Layer Explanation](#detailed-layer-by-layer-explanation)
   - [Feature Files (BDD Layer)](#1-feature-files-bdd-layer)
   - [Step Definitions (Glue Layer)](#2-step-definitions-glue-layer)
   - [Hooks (Lifecycle Management)](#3-hooks-lifecycle-management)
   - [Page Objects (UI Interaction Layer)](#4-page-objects-ui-interaction-layer)
   - [Locators (Element Repository)](#5-locators-element-repository)
   - [Test Data (Data Layer)](#6-test-data-data-layer)
   - [Configuration](#7-configuration)
   - [Utilities](#8-utilities)
5. [Setup & Installation](#setup--installation)
6. [Running Tests](#running-tests)
7. [Tags & Selective Execution](#tags--selective-execution)
8. [Reports & Screenshots](#reports--screenshots)
9. [Logging](#logging)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Code Quality](#code-quality)
12. [How to Extend the Framework](#how-to-extend-the-framework)

---

## Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v18+ / v20+ / v22+ | JavaScript runtime |
| **Playwright** | ^1.34.0 | Cross-browser automation engine (Chromium, Firefox, WebKit) |
| **Cucumber.js** | ^8.10.0 | BDD framework — Gherkin feature files and step definitions |
| **Chai** | ^4.3.7 | Assertion library with natural language `expect` syntax |
| **ESLint** | ^8.57.1 | Static analysis and code quality enforcement |
| **cucumber-html-reporter** | ^5.5.0 | Generates Bootstrap-themed HTML reports from JSON |

---

## Framework Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXECUTION FLOW                              │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │   Feature     │───>│  Step            │───>│  Page Objects    │  │
│  │   Files       │    │  Definitions     │    │  (POM Layer)     │  │
│  │  (.feature)   │    │  (.js)           │    │  (.js)           │  │
│  │               │    │                  │    │                  │  │
│  │  Gherkin      │    │  Maps Given/     │    │  Encapsulates    │  │
│  │  scenarios    │    │  When/Then to    │    │  UI actions      │  │
│  │  in plain     │    │  code functions  │    │  and locators    │  │
│  │  English      │    │                  │    │                  │  │
│  └──────────────┘    └──────────────────┘    └──────┬───────────┘  │
│                                                      │              │
│                                                      ▼              │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Test Data    │    │  Config          │    │  Playwright      │  │
│  │  (JSON)       │    │  (config.json)   │    │  Browser API     │  │
│  │               │    │                  │    │                  │  │
│  │  Candidate,   │    │  Base URL,       │    │  click, fill,    │  │
│  │  Vacancy,     │    │  browser type,   │    │  waitFor,        │  │
│  │  Login creds  │    │  headless mode   │    │  screenshot      │  │
│  └──────────────┘    └──────────────────┘    └──────────────────┘  │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  Hooks        │    │  Logger          │    │  Reporter        │  │
│  │  (hooks.js)   │    │  (logger.js)     │    │  (generateReport)│  │
│  │               │    │                  │    │                  │  │
│  │  Browser      │    │  Timestamped     │    │  HTML report     │  │
│  │  launch/close │    │  file + console  │    │  from JSON       │  │
│  │  screenshots  │    │  logging         │    │  output          │  │
│  └──────────────┘    └──────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### How the Framework Executes a Test

1. **Cucumber reads** the `.feature` file and parses Gherkin steps (`Given`, `When`, `Then`).
2. **`BeforeAll` hook** runs once — logs suite start and creates the `screenshots/` directory.
3. **`Before` hook** runs for each scenario — launches a fresh browser, creates a new page, instantiates page objects (`LoginPage`, `RecruitmentPage`), and prepares unique test data (timestamp-based email/vacancy name).
4. **Step definitions** match the Gherkin text to JavaScript functions. Each function calls methods on page objects.
5. **Page objects** interact with the browser using Playwright's API — clicking, filling forms, waiting for elements, and asserting results. Locators are loaded from the JSON locator file.
6. **`After` hook** runs after each scenario — captures a full-page screenshot if the scenario failed (and attaches it to the report), then closes the browser.
7. **`AfterAll` hook** runs once at the end — logs suite completion.
8. **Report generation** converts the Cucumber JSON output into a styled HTML report.

---

## Project Structure

```
OrangeProject/
├── .github/
│   └── workflows/
│       └── test.yml                  # GitHub Actions CI/CD pipeline
├── config/
│   └── config.json                   # Environment configuration
├── features/
│   ├── login.feature                 # Login, Logout, Negative login tests
│   └── recruitment.feature           # Candidate & Vacancy workflows
├── locators/
│   └── recruitmentLocators.json      # Centralized CSS/XPath selectors
├── pages/
│   ├── basePage.js                   # Base page class (reusable methods)
│   ├── loginPage.js                  # Login page object
│   └── recruitmentPage.js            # Recruitment module page object
├── step-definitions/
│   ├── hooks.js                      # Cucumber lifecycle hooks
│   ├── loginSteps.js                 # Login & session step definitions
│   └── recruitmentSteps.js           # Candidate & Vacancy step definitions
├── test-data/
│   ├── candidate.json                # Candidate + shortlist + search data
│   ├── login.json                    # Valid & invalid credentials
│   ├── vacancy.json                  # Vacancy form data
│   └── resume/
│       └── sample_resume.pdf         # Sample resume for file upload
├── utils/
│   ├── cleanReports.js               # Pre-test report cleanup
│   ├── fileHelper.js                 # File path resolver utility
│   ├── generateReport.js             # HTML report generator
│   └── logger.js                     # Custom logging utility
├── .eslintrc.json                    # ESLint rules
├── .gitignore                        # Git ignore patterns
├── cucumber.js                       # Cucumber default profile
├── package.json                      # Dependencies & npm scripts
└── README.md                         # This file
```

---

## Detailed Layer-by-Layer Explanation

### 1. Feature Files (BDD Layer)

**Location:** `features/`

Feature files are written in **Gherkin syntax** — a plain-English, business-readable format. They describe the behavior of the application without any code, so non-technical stakeholders (QA leads, business analysts) can understand and review them.

#### `login.feature`

```gherkin
@regression
Feature: Login and Session Management

  @smoke @login
  Scenario: Successful login with valid admin credentials
    Given I open the OrangeHRM login page
    When I login with admin credentials
    Then I should see the dashboard
    When I logout from the application
    Then I should see the login page

  @negative @login
  Scenario Outline: Login fails with invalid credentials
    Given I open the OrangeHRM login page
    When I enter username "<username>" and password "<password>"
    Then I should see the error message "<error>"

    Examples:
      | username    | password  | error               |
      | Admin       | wrongpass | Invalid credentials |
      | invalidUser | admin123  | Invalid credentials |
```

**Key Concepts:**
- **`@regression`** on the Feature line means every scenario in this file is included in regression runs.
- **`Scenario Outline`** is used for **data-driven testing**. The scenario is executed once per row in the `Examples` table. Cucumber substitutes `<username>`, `<password>`, and `<error>` with the actual values from each row. This means 1 Scenario Outline generates 2 test executions.
- **Tags** (`@smoke`, `@negative`, `@login`) allow selective execution. You can run only `@smoke` tests or only `@negative` tests.

#### `recruitment.feature`

```gherkin
@regression
Feature: Recruitment - Candidates flow

  Background:
    Given I open the OrangeHRM login page
    And I login with admin credentials

  @smoke @candidate
  Scenario: Add, shortlist and search a candidate
    When I navigate to the Recruitment -> Candidates page
    Then I should see the Candidates page
    When I click Add Candidate
    ...
    Then the search results should contain the candidate with expected vacancy and status

  @smoke @vacancy
  Scenario: Create a vacancy with attachment and verify in search
    When I navigate to the Recruitment -> Vacancies page
    ...
    Then the search results should contain the created vacancy
```

**Key Concepts:**
- **`Background`** contains steps that run before every scenario in the file. Here, login is the background because both the Candidate and Vacancy flows require an authenticated session.
- **`And`** is an alias for the preceding keyword (`Given`/`When`/`Then`) — it makes the feature file more readable.

---

### 2. Step Definitions (Glue Layer)

**Location:** `step-definitions/`

Step definitions are the **glue** between Gherkin steps and actual code. Each Gherkin line (e.g., `When I click Add Candidate`) maps to a JavaScript function that performs the action.

#### `loginSteps.js` — Login & session steps

```javascript
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const logger = require('../utils/logger');

Then('I should see the dashboard', async function () {
  const visible = await this.loginPage.isDashboardVisible();
  expect(visible, 'Dashboard should be visible after login').to.be.true;
  logger.info('Dashboard is visible');
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
```

#### `recruitmentSteps.js` — Candidate & vacancy steps

Contains ~20 step definitions organized into sections:
- **Background Steps** — `Given I open the OrangeHRM login page`, `Given I login with admin credentials`
- **Candidate Flow Steps** — Navigate, add candidate, fill form, save, verify profile, shortlist, search
- **Vacancy Flow Steps** — Navigate, add vacancy, fill form, save, add attachment, search

**Key Patterns in Step Definitions:**
- **`this` context** — Cucumber's World object. `this.loginPage`, `this.recruitmentPage`, `this.candidateData` are set in the `Before` hook and shared across all steps within a scenario.
- **`{string}` parameters** — Cucumber expression parameters. When Gherkin says `When I enter username "Admin"`, Cucumber extracts `"Admin"` and passes it as the `username` argument.
- **Meaningful assertions** — Every `expect()` includes a descriptive failure message (e.g., `'Dashboard should be visible after login'`) so failures are understandable.
- **Logging** — Each step logs its start and end using `logger.info()`.

---

### 3. Hooks (Lifecycle Management)

**Location:** `step-definitions/hooks.js`

Hooks are Cucumber lifecycle callbacks that run at specific points during test execution. They handle setup, teardown, and cross-cutting concerns.

```
Test Suite Lifecycle:

  BeforeAll ─── Runs once at the very start
    │
    ├── Before ─── Runs before EACH scenario
    │     │
    │     ├── Step 1 (Given...)
    │     ├── Step 2 (When...)
    │     ├── Step 3 (Then...)
    │     │
    │     └── After ─── Runs after EACH scenario
    │
    ├── Before ─── Next scenario
    │     ├── Steps...
    │     └── After
    │
  AfterAll ─── Runs once at the very end
```

#### What Each Hook Does:

**`BeforeAll`** — Runs once before any scenario:
- Logs the suite start time.
- Creates the `screenshots/` directory if it doesn't exist.

**`Before`** — Runs before every individual scenario:
- Logs the scenario name.
- Launches a fresh browser instance (Chromium/Firefox/WebKit based on config).
- Creates a new browser context and page.
- Sets the default page timeout from config.
- Instantiates page objects: `this.loginPage = new LoginPage(this.page)`.
- Prepares **unique test data** by appending a timestamp to email and vacancy name. This prevents data collisions when running tests in parallel or repeatedly against the same environment.

```javascript
const ts = Date.now();
this.candidateData = { ...recruitmentData.candidate, email: `john.doe.${ts}@example.com` };
this.vacancyData = { ...vacancyData.vacancy, name: `${vacancyData.vacancy.name} ${ts}` };
```

**`After`** — Runs after every individual scenario:
- Logs the scenario result (PASSED/FAILED).
- If the scenario **failed**, captures a full-page screenshot, saves it to `screenshots/`, and attaches it to the Cucumber report using `this.attach(screenshot, 'image/png')`.
- Closes the browser — ensures no browser processes are left hanging.

**`AfterAll`** — Runs once after all scenarios are done:
- Logs the suite completion.

#### Why a Fresh Browser Per Scenario?

Each scenario gets its own browser instance to ensure **test isolation**. One scenario's state (cookies, session, DOM changes) cannot affect another. This is critical for reliable, parallelizable tests.

---

### 4. Page Objects (UI Interaction Layer)

**Location:** `pages/`

The **Page Object Model (POM)** encapsulates all UI interactions within class methods. Tests never interact with the browser directly — they call page object methods instead. This creates a single point of maintenance: if a UI element changes, you update one page object method, not every test.

#### Inheritance Hierarchy

```
BasePage (abstract base)
    ├── LoginPage (login, logout, error handling)
    └── RecruitmentPage (candidates, vacancies)
```

#### `basePage.js` — The Foundation

Every page object inherits from `BasePage`, which provides six reusable methods:

| Method | What It Does |
|--------|-------------|
| `goto(url)` | Navigates to a URL and waits for `domcontentloaded` |
| `click(selector)` | Waits for the element to be visible, then clicks it |
| `fill(selector, value)` | Waits for the element to be visible, then fills it with text |
| `selectOption(selector, value)` | Selects a dropdown option by its visible label |
| `uploadFile(selector, filePath)` | Resolves the file path and sets it on a file input |
| `expectText(selector, expected)` | Asserts that an element's text includes the expected value |

**Key detail:** Every `click` and `fill` method includes a built-in `waitFor({ state: 'visible' })` call. This means the framework uses **explicit waits** everywhere — it never sleeps for a fixed duration. If the element appears in 200ms, the test proceeds in 200ms. If it takes 5 seconds, the test waits 5 seconds. This makes tests both fast and reliable.

#### `loginPage.js` — Authentication

Extends `BasePage` and handles all login/logout/session operations.

| Method | Purpose |
|--------|---------|
| `open()` | Navigates to the base URL from `config.json` |
| `login(username, password)` | Fills credentials, submits, and waits for the dashboard URL. Uses `try/catch` to log and rethrow errors |
| `loginExpectingFailure(username, password)` | Fills credentials, submits, and waits for the **error message** (not the dashboard). Used by negative login tests |
| `getErrorMessage()` | Reads the text from the error alert element (`p.oxd-alert-content-text`) |
| `isDashboardVisible()` | Checks if the "Dashboard" header is visible |
| `logout()` | Clicks the user dropdown → Logout link → waits for the login page to appear |
| `isLoginPageVisible()` | Checks if the username input field is visible |

#### `recruitmentPage.js` — Recruitment Module

Extends `BasePage` and handles the entire Recruitment module (candidates + vacancies). This is the largest page object (~370 lines) because the Recruitment module has complex UI patterns.

**Navigation Methods:**

| Method | What It Does |
|--------|-------------|
| `goToCandidates()` | Clicks "Recruitment" in the sidebar, waits for the Candidates page header |
| `goToVacancies()` | Clicks "Recruitment", then clicks the "Vacancies" tab |
| `navigateBackToCandidatesList()` | Returns to the candidate list view |

**Candidate Flow Methods:**

| Method | What It Does |
|--------|-------------|
| `clickAddCandidate()` | Clicks the "Add" button and waits for the Add Candidate form |
| `fillAddCandidateForm(candidate)` | Fills all form fields: first/middle/last name, vacancy dropdown, email, contact, file upload, keywords, date, notes, and consent checkbox. Wrapped in `try/catch` |
| `saveCandidate()` | Clicks Save and waits for the Candidate Profile page header |
| `shortlistCandidate(notes)` | Clicks the Shortlist button, fills notes, clicks Save |
| `getCandidateStatusFromProfile()` | Reads the status badge from the candidate's profile page |
| `searchCandidateByVacancy(vacancy)` | Selects a vacancy from the filter dropdown and clicks Search |

**Vacancy Flow Methods:**

| Method | What It Does |
|--------|-------------|
| `clickAddVacancy()` | Clicks "Add" and waits for the Add Vacancy form |
| `fillAddVacancyForm(vacancy)` | Fills vacancy name, selects job title from dropdown (with fallback), types hiring manager name into autosuggest field (polls until valid suggestions appear), sets number of positions. Wrapped in `try/catch` |
| `saveVacancy()` | Clicks Save and waits for "Edit Vacancy" header (indicates successful save) |
| `addVacancyAttachment(filePath, comment)` | Scrolls to Attachments section, finds the Add button (using multiple strategies), uploads a file, fills a comment, and saves |
| `isVacancyAttachmentPresent(comment)` | Verifies the attachment appears in the attachments table |
| `searchVacancyByName(name)` | Opens the Vacancy filter dropdown, waits for options to stabilize, selects the matching vacancy, and clicks Search |
| `isVacancyInResults(name)` | Checks if the vacancy name appears in any result row |

**Dropdown Helper Methods:**

| Method | What It Does |
|--------|-------------|
| `selectDropdownOption(selector, text)` | Opens a custom OrangeHRM dropdown and selects an option by its visible text |
| `selectFirstRealDropdownOption(selector)` | Opens a dropdown and selects the first option that is NOT "-- Select --". Used as a fallback when the exact option text might vary |

**Complex UI Interaction — Hiring Manager Autosuggest:**

The hiring manager field uses an autocomplete widget. The framework types a search character (`"a"`), then enters a polling loop that checks the suggestion list up to 10 times. It skips entries showing "Searching…." or "No Records Found" and clicks the first real person name that appears. This handles the asynchronous nature of the API-driven suggestion list.

---

### 5. Locators (Element Repository)

**Location:** `locators/recruitmentLocators.json`

All CSS and XPath selectors are stored in a single JSON file, organized by page/section. This means:
- **Zero hardcoded selectors** in page objects or step definitions.
- If a UI element changes, you update **one entry** in the JSON file.
- Locators are grouped logically for easy navigation.

#### JSON Structure

```json
{
  "login": {
    "username": "input[name='username']",
    "password": "input[name='password']",
    "loginButton": "button[type='submit']",
    "dashboardHeader": "h6:has-text('Dashboard')",
    "errorMessage": "p.oxd-alert-content-text"
  },
  "nav": {
    "recruitmentLink": "nav[aria-label='Sidepanel'] a:has-text('Recruitment')",
    "userDropdown": "span.oxd-userdropdown-tab",
    "logoutLink": "a:has-text('Logout')"
  },
  "vacanciesPage": { ... },
  "candidatesPage": { ... },
  "addCandidateForm": { ... },
  "candidateProfile": { ... },
  "shortlist": { ... },
  "addVacancyForm": { ... },
  "vacancy": { ... }
}
```

#### Selector Strategy

The framework uses a mix of:
- **CSS selectors** for simple elements: `input[name='username']`, `button[type='submit']`
- **Playwright-specific `:has-text()`** pseudo-selector for text-based matching: `h6:has-text('Dashboard')`
- **XPath** for complex structures where CSS is insufficient — e.g., locating an input field by its label in the OrangeHRM component library:
  ```
  (//label[normalize-space()='Email']/ancestor::div[contains(@class,'oxd-input-group')]//input)[1]
  ```
  This XPath finds a label with text "Email", goes up to the parent `oxd-input-group` container, then finds the `input` inside it. This is necessary because OrangeHRM uses a custom component library where labels and inputs are siblings inside container divs, not connected by `for`/`id` attributes.

---

### 6. Test Data (Data Layer)

**Location:** `test-data/`

All test data is externalized into JSON files. No test data is hardcoded in step definitions or page objects.

#### `login.json`

```json
{
  "admin": {
    "username": "Admin",
    "password": "admin123"
  },
  "invalidCredentials": [
    { "username": "Admin",       "password": "wrongpass", "expectedError": "Invalid credentials" },
    { "username": "invalidUser", "password": "admin123",  "expectedError": "Invalid credentials" }
  ]
}
```

#### `candidate.json`

Contains candidate form data (first name, last name, email, vacancy, resume path, etc.), shortlist notes, and search criteria. The email is made unique at runtime by the `Before` hook.

#### `vacancy.json`

Contains vacancy form data (name, job title, hiring manager search term, number of positions, attachment path and comment). The vacancy name is made unique at runtime.

#### `resume/sample_resume.pdf`

A valid PDF file used for both candidate resume upload and vacancy attachment upload.

#### Why Externalized Data Matters

- **Maintenance:** Change test data without touching code.
- **Reusability:** Multiple scenarios can share the same data files.
- **Uniqueness:** The `Before` hook appends a `Date.now()` timestamp to email and vacancy name, so each test run creates unique records even against a shared environment.

---

### 7. Configuration

**Location:** `config/config.json`

```json
{
  "baseUrl": "https://opensource-demo.orangehrmlive.com/",
  "browser": "chromium",
  "headless": false,
  "timeout": 30000
}
```

| Key | Description | Possible Values |
|-----|-------------|-----------------|
| `baseUrl` | The URL of the application under test | Any valid URL |
| `browser` | Which browser engine to use | `chromium`, `firefox`, `webkit` |
| `headless` | Whether to run without a visible browser window | `true` / `false` |
| `timeout` | Default timeout for Playwright actions (ms) | Any positive integer |

**Environment Variable Override:** The `HEADLESS` environment variable overrides the config setting. This is used by the CI/CD pipeline to force headless mode: `HEADLESS=true npm run test:smoke`.

---

### 8. Utilities

**Location:** `utils/`

#### `logger.js` — Custom Logging

Provides a simple logging utility that writes to both the console and a file (`logs/test-execution.log`).

```javascript
const logger = {
  info:  (msg) => writeLog('INFO',  msg),
  warn:  (msg) => writeLog('WARN',  msg),
  error: (msg) => writeLog('ERROR', msg),
  debug: (msg) => writeLog('DEBUG', msg),
  clear: () => { /* clears the log file */ }
};
```

Every log line includes an ISO timestamp and severity level:
```
[2025-01-15T10:23:45.123Z] [INFO] Scenario Started: Add, shortlist and search a candidate
[2025-01-15T10:23:46.456Z] [INFO] Opening OrangeHRM login page
[2025-01-15T10:23:48.789Z] [INFO] Login successful – redirected to dashboard
[2025-01-15T10:23:49.012Z] [ERROR] Failed to fill candidate form: Element not found
```

#### `cleanReports.js` — Pre-Test Cleanup

Runs automatically before every test execution (via the `pretest` npm script). Deletes all files in the `reports/` directory so each run starts with a clean slate.

#### `generateReport.js` — HTML Report Generation

Runs after test execution. Reads the Cucumber JSON output (`reports/cucumber-report.json`) and generates a styled HTML report using the `cucumber-html-reporter` package with the Bootstrap theme. The report includes metadata:
- Browser type
- Framework name
- Environment name

#### `fileHelper.js` — Path Resolution

Provides a `resolvePath(relativePath)` function that resolves file paths relative to the project root. Used by `BasePage.uploadFile()` and `RecruitmentPage.addVacancyAttachment()` to correctly locate files regardless of the current working directory.

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node.js)
- **Git** (for cloning)

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd OrangeProject

# 2. Install project dependencies
npm install

# 3. Install Playwright browser binaries
npx playwright install
```

---

## Running Tests

### All Tests

```bash
npm test
```

This runs the `pretest` script first (cleans old reports), then executes all feature files, and finally generates the HTML report.

### With Console Progress Output

```bash
npm run test:pretty
```

Shows step-by-step progress in the console (dots/letters for pass/fail).

### Tag-Based Execution

```bash
npm run test:smoke         # @smoke — Login + Candidate + Vacancy
npm run test:regression    # @regression — All scenarios
npm run test:candidate     # @candidate — Candidate scenario only
npm run test:vacancy       # @vacancy — Vacancy scenario only
npm run test:login         # @login — Login & logout scenarios
npm run test:negative      # @negative — Invalid login data-driven tests
```

### Parallel Execution

```bash
npm run test:parallel      # Runs scenarios across 2 workers
```

Cucumber's `--parallel 2` flag distributes scenarios across 2 worker processes. Each worker gets its own browser instance and isolated test data (thanks to timestamp-based unique data).

### Headless Mode

```bash
# Windows
set HEADLESS=true && npm test

# Linux/Mac
HEADLESS=true npm test
```

### Generate Report Only

```bash
npm run report
```

---

## Tags & Selective Execution

Tags are Gherkin annotations that categorize scenarios. They enable selective test execution.

| Tag | Applied To | What It Includes |
|-----|-----------|-----------------|
| `@regression` | Feature level | Every scenario in the feature file |
| `@smoke` | Scenario level | Login + Candidate + Vacancy (3 scenarios) |
| `@login` | Scenario level | Login/logout + negative login (3 scenarios) |
| `@candidate` | Scenario level | Add, shortlist, and search candidate (1 scenario) |
| `@vacancy` | Scenario level | Create vacancy with attachment and search (1 scenario) |
| `@negative` | Scenario level | Invalid login Scenario Outline (2 data rows) |

Tags can be combined with expressions in Cucumber: `--tags "@smoke and not @login"`.

### Test Coverage Summary

| Scenario | Tags | Steps | Type |
|----------|------|-------|------|
| Successful login and logout | `@smoke @login` | 5 | Regular |
| Login fails with invalid credentials | `@negative @login` | 3 × 2 rows | Scenario Outline |
| Add, shortlist and search a candidate | `@smoke @candidate` | 12 | Regular |
| Create a vacancy with attachment and verify | `@smoke @vacancy` | 13 | Regular |

**Total:** 5 feature-level scenarios · 39 steps across all executions

---

## Reports & Screenshots

### HTML Report

After every test run, a Bootstrap-themed HTML report is generated at `reports/cucumber-report.html`. It includes:
- Pass/fail status for every scenario and step
- Execution duration per step
- Embedded failure screenshots
- Metadata (browser, framework, environment)

### Screenshot on Failure

When a scenario fails, the `After` hook automatically:
1. Captures a **full-page screenshot** of the browser.
2. Saves it to `screenshots/<scenario_name>.png`.
3. Attaches the image to the Cucumber report using `this.attach(screenshot, 'image/png')`.

This means you can see exactly what the page looked like at the moment of failure — directly inside the HTML report.

---

## Logging

The custom logger writes every action to both the console and `logs/test-execution.log`.

**Log levels:**
- `INFO` — Normal flow (scenario start/end, step actions, navigation)
- `WARN` — Non-critical issues
- `ERROR` — Failures (screenshot paths, form fill errors)
- `DEBUG` — Diagnostic details

**Sample log output:**
```
[2025-01-15T10:23:45.123Z] [INFO] ========== Test Suite Started ==========
[2025-01-15T10:23:45.200Z] [INFO] Scenario Started: Add, shortlist and search a candidate
[2025-01-15T10:23:45.300Z] [INFO] Browser launched: chromium | headless: false
[2025-01-15T10:23:46.456Z] [INFO] Opening OrangeHRM login page
[2025-01-15T10:23:48.789Z] [INFO] Login successful – redirected to dashboard
[2025-01-15T10:23:49.100Z] [INFO] Navigating to Recruitment → Candidates page
[2025-01-15T10:24:10.500Z] [INFO] Candidate saved successfully
[2025-01-15T10:24:15.800Z] [INFO] Scenario Finished: Add, shortlist... | Status: PASSED
[2025-01-15T10:24:15.900Z] [INFO] Browser closed
```

---

## CI/CD Pipeline

**Location:** `.github/workflows/test.yml`

The GitHub Actions workflow runs automatically on every `push` or `pull_request` to `main`/`master`.

### Pipeline Steps

```yaml
1. Checkout code
2. Setup Node.js (matrix: 18, 20)
3. npm ci (clean install)
4. npx playwright install --with-deps chromium
5. npm run test:smoke (HEADLESS=true)
6. Upload HTML report as artifact (always)
7. Upload failure screenshots as artifact (on failure)
```

### Key CI Features

- **Matrix testing** — Tests run on both Node.js 18 and 20 to ensure compatibility.
- **Headless mode** — CI always runs headless via the `HEADLESS=true` environment variable.
- **Artifact uploads** — Test reports and failure screenshots are uploaded as downloadable artifacts, available from the GitHub Actions run page.
- **`if: always()`** — The report upload step runs even if tests fail, so you always have the HTML report.

---

## Code Quality

### ESLint Configuration (`.eslintrc.json`)

| Rule | Setting | Purpose |
|------|---------|---------|
| `semi` | Always required | Enforces semicolons |
| `quotes` | Single quotes | Consistent string style |
| `indent` | 2 spaces | Consistent indentation |
| `no-var` | Error | Forces `let`/`const` over `var` |
| `prefer-const` | Warn | Prefer `const` when variable is never reassigned |
| `no-trailing-spaces` | Error | Clean line endings |
| `eol-last` | Error | Files must end with a newline |
| `no-unused-vars` | Warn | Catches dead code (ignores `_` prefixed args) |

Run the linter:
```bash
npm run lint
```

This will check all files in `pages/`, `step-definitions/`, and `utils/` and auto-fix issues where possible.

---

## How to Extend the Framework

### Adding a New Test Scenario

1. **Write the Gherkin** in an existing or new `.feature` file:
   ```gherkin
   @smoke @leave
   Scenario: Apply for leave
     Given I open the OrangeHRM login page
     And I login with admin credentials
     When I navigate to the Leave module
     And I apply for leave with valid data
     Then the leave request should be visible
   ```

2. **Create the Page Object** — Add a new file `pages/leavePage.js`:
   ```javascript
   const BasePage = require('./basePage');
   const locators = require('../locators/recruitmentLocators.json');

   class LeavePage extends BasePage {
     constructor(page) { super(page); }

     async navigateToLeave() {
       await this.click(locators.nav.leaveLink);
     }
   }

   module.exports = LeavePage;
   ```

3. **Add Locators** — Add a new section in `locators/recruitmentLocators.json`:
   ```json
   "leave": {
     "leaveLink": "a:has-text('Leave')",
     "applyButton": "button:has-text('Apply')"
   }
   ```

4. **Add Test Data** — Create `test-data/leave.json` with the required data.

5. **Write Step Definitions** — Create `step-definitions/leaveSteps.js`:
   ```javascript
   const { When, Then } = require('@cucumber/cucumber');
   const { expect } = require('chai');

   When('I navigate to the Leave module', async function () {
     await this.leavePage.navigateToLeave();
   });
   ```

6. **Register in Hooks** — Instantiate the new page object in the `Before` hook:
   ```javascript
   this.leavePage = new LeavePage(this.page);
   ```

7. **Run** — `npm run test:smoke` or target the new tag with a custom npm script.

### Adding a New Browser

Change `config/config.json`:
```json
{ "browser": "firefox" }
```

No code changes needed — the `Before` hook already supports Chromium, Firefox, and WebKit.

---

## Design Principles

| Principle | How It's Applied |
|-----------|-----------------|
| **Separation of Concerns** | Features, steps, pages, locators, and data are all in separate layers |
| **DRY (Don't Repeat Yourself)** | Common actions live in `BasePage`; shared login lives in `Background` |
| **Single Responsibility** | Each page object handles one module; each step definition handles one action |
| **Test Isolation** | Fresh browser per scenario; unique data per run (timestamps) |
| **Explicit Waits** | Every interaction waits for the element to be visible — no `sleep()` calls |
| **Fail Fast with Context** | Assertions include descriptive messages; errors are logged and rethrown |
| **Config over Code** | Browser, URL, timeouts, and test data are all configurable without code changes |

