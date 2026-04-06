const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'test-execution.log');

function getTimestamp() {
  return new Date().toISOString();
}

function writeLog(level, message) {
  const line = `[${getTimestamp()}] [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

const logger = {
  info: (msg) => writeLog('INFO', msg),
  warn: (msg) => writeLog('WARN', msg),
  error: (msg) => writeLog('ERROR', msg),
  debug: (msg) => writeLog('DEBUG', msg),
  clear: () => {
    if (fs.existsSync(logFile)) fs.writeFileSync(logFile, '');
  }
};

module.exports = logger;
