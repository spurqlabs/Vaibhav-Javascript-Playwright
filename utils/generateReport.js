const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, '..', 'reports', 'cucumber-report.json');
const htmlFile = path.join(__dirname, '..', 'reports', 'cucumber-report.html');

const options = {
  theme: 'bootstrap',
  jsonFile: jsonFile,
  output: htmlFile,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'Browser': 'Chromium',
    'Framework': 'Playwright + Cucumber',
    'Environment': 'OrangeHRM Demo'
  }
};

if (fs.existsSync(jsonFile)) {
  reporter.generate(options);
  console.log(`\n✅ HTML report generated: ${htmlFile}`);
} else {
  console.warn('❌ JSON report not found at', jsonFile);
}

