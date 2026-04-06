const path = require('path');

function resolvePath(relPath) {
  return path.resolve(__dirname, '..', relPath);
}

module.exports = { resolvePath };

