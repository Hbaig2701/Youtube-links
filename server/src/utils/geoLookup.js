const geoip = require('geoip-lite');

function geoLookup(ip) {
  const geo = geoip.lookup(ip);
  if (!geo) return { country: null, city: null };
  return {
    country: geo.country || null,
    city: geo.city || null,
  };
}

module.exports = geoLookup;
