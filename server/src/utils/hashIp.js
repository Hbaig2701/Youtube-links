const crypto = require('crypto');

const SECRET = process.env.IP_HASH_SECRET || 'default-dev-secret';

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + SECRET).digest('hex');
}

module.exports = hashIp;
