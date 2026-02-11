const UAParser = require('ua-parser-js');

function parseUserAgent(uaString) {
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    deviceType: result.device.type || 'desktop',
  };
}

module.exports = parseUserAgent;
