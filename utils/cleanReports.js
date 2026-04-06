const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'reports');

if (fs.existsSync(reportsDir)) {
  const files = fs.readdirSync(reportsDir);
  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    fs.unlinkSync(filePath);
  }
  console.log('Old reports cleaned.');
} else {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('Reports directory created.');
}
