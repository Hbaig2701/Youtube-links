const crypto = require('crypto');
const linkModel = require('../models/link.model');
const clickModel = require('../models/click.model');
const hashIp = require('../utils/hashIp');
const parseUserAgent = require('../utils/parseUserAgent');
const geoLookup = require('../utils/geoLookup');
const buildRedirectUrl = require('../utils/buildRedirectUrl');

async function handleRedirect(req, res, next) {
  try {
    const { videoSlug, linkLabel } = req.params;

    const link = await linkModel.findByVideoSlugAndLabel(videoSlug, linkLabel);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Link has expired' });
    }

    const sessionId = crypto.randomUUID();
    const redirectUrl = buildRedirectUrl(link.destination_url, {
      videoSlug,
      linkLabel,
      sessionId,
    });

    res.redirect(302, redirectUrl);

    // Log click after response is sent (fire-and-forget)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const ua = parseUserAgent(req.headers['user-agent'] || '');
    const geo = geoLookup(ip);

    clickModel.create({
      linkId: link.id,
      ipHash: hashIp(ip),
      country: geo.country,
      city: geo.city,
      deviceType: ua.deviceType,
      browser: ua.browser,
      os: ua.os,
      referrer: req.headers['referer'] || null,
      sessionId,
    }).catch(err => console.error('Click logging failed:', err));
  } catch (err) {
    next(err);
  }
}

module.exports = { handleRedirect };
