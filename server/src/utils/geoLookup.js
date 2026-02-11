let geoip;
try {
  geoip = require('geoip-lite');
} catch {
  geoip = null;
}

function geoLookup(ip) {
  if (!geoip) return { country: null, city: null };
  const geo = geoip.lookup(ip);
  if (!geo) return { country: null, city: null };
  return {
    country: geo.country || null,
    city: geo.city || null,
  };
}

module.exports = geoLookup;
