const bookingModel = require('../models/booking.model');
const linkModel = require('../models/link.model');
const settingModel = require('../models/setting.model');
const pool = require('../db/connection');

/** Return the first truthy value found under any of the given keys on obj. */
function getField(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return obj[k];
  }
  return null;
}

async function handleGhlWebhook(req, res, next) {
  try {
    // Verify webhook secret if configured
    const secret = await settingModel.get('ghl_webhook_secret');
    if (secret) {
      const provided = req.headers['x-webhook-secret'] || req.query.secret;
      if (provided !== secret) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }
    }

    const payload = req.body;

    const eventType = payload.type || payload.event || 'appointment.created';

    // Extract contact info — check nested objects AND top-level flat fields
    const contact = payload.contact || {};
    const appointment = payload.appointment || payload.calendar || {};

    const contactName =
      getField(contact, 'name', 'full_name', 'Name', 'Full_Name', 'fullName') ||
      getField(payload, 'Name', 'name', 'Full_Name', 'full_name', 'fullName') ||
      [
        getField(contact, 'first_name', 'firstName', 'First_Name') || getField(payload, 'first_name', 'firstName', 'First_Name'),
        getField(contact, 'last_name', 'lastName', 'Last_Name') || getField(payload, 'last_name', 'lastName', 'Last_Name'),
      ].filter(Boolean).join(' ') ||
      'Unknown';

    const contactEmail =
      getField(contact, 'email', 'contact_email', 'Email') ||
      getField(payload, 'email', 'Email', 'contact_email') ||
      null;

    const ghlContactId =
      getField(contact, 'id', 'contact_id', 'contactId') ||
      getField(payload, 'contact_id', 'contactId') ||
      null;

    const ghlBookingId =
      getField(appointment, 'id', 'appointment_id', 'appointmentId') ||
      getField(payload, 'appointment_id', 'appointmentId', 'id') ||
      null;

    const appointmentTime =
      getField(appointment, 'start_time', 'startTime', 'selected_slot', 'selectedTimeslot') ||
      getField(payload, 'start_time', 'startTime', 'selected_slot', 'selectedTimeslot') ||
      null;

    const utms = extractUtms(payload);

    // Handle status updates for existing bookings
    if (eventType.includes('cancelled') || eventType.includes('canceled')) {
      if (ghlBookingId) {
        const existing = await bookingModel.findByGhlBookingId(String(ghlBookingId));
        if (existing) {
          await bookingModel.updateStatus(String(ghlBookingId), 'cancelled');
          return res.json({ status: 'updated', booking_id: existing.id });
        }
      }
    }

    if (eventType.includes('completed') || eventType.includes('showed')) {
      if (ghlBookingId) {
        const existing = await bookingModel.findByGhlBookingId(String(ghlBookingId));
        if (existing) {
          await bookingModel.updateStatus(String(ghlBookingId), 'completed');
          return res.json({ status: 'updated', booking_id: existing.id });
        }
      }
    }

    if (eventType.includes('no-show') || eventType.includes('noshow') || eventType.includes('no_show')) {
      if (ghlBookingId) {
        const existing = await bookingModel.findByGhlBookingId(String(ghlBookingId));
        if (existing) {
          await bookingModel.updateStatus(String(ghlBookingId), 'no-show');
          return res.json({ status: 'updated', booking_id: existing.id });
        }
      }
    }

    // Skip if we already have this booking
    if (ghlBookingId) {
      const existing = await bookingModel.findByGhlBookingId(String(ghlBookingId));
      if (existing) {
        return res.json({ status: 'duplicate', booking_id: existing.id });
      }
    }

    // Attribution: match UTMs to a click
    let clickId = null;
    let linkId = null;
    let timeToBookSeconds = null;

    // Best match: session_id (utm_term) → exact click
    if (utms.utm_term) {
      const { rows } = await pool.query('SELECT * FROM clicks WHERE session_id = $1', [utms.utm_term]);
      const click = rows[0];
      if (click) {
        clickId = click.id;
        linkId = click.link_id;
        const clickTime = new Date(click.clicked_at).getTime();
        const bookTime = Date.now();
        timeToBookSeconds = Math.round((bookTime - clickTime) / 1000);
      }
    }

    // Fallback: utm_campaign (video slug) + utm_content (link label)
    if (!linkId && utms.utm_campaign && utms.utm_content) {
      const link = await linkModel.findByVideoSlugAndLabel(utms.utm_campaign, utms.utm_content);
      if (link) {
        linkId = link.id;
      }
    }

    const booking = await bookingModel.create({
      clickId,
      linkId,
      ghlContactId: ghlContactId ? String(ghlContactId) : null,
      ghlBookingId: ghlBookingId ? String(ghlBookingId) : null,
      contactName,
      contactEmail,
      appointmentTime,
      status: 'confirmed',
      utmSource: utms.utm_source,
      utmCampaign: utms.utm_campaign,
      utmContent: utms.utm_content,
      utmTerm: utms.utm_term,
      timeToBookSeconds,
    });

    // Log raw payload for debugging / future re-processing
    try {
      await pool.query(
        'INSERT INTO webhook_logs (event_type, payload, booking_id) VALUES ($1, $2, $3)',
        [eventType, JSON.stringify(payload), booking.id]
      );
    } catch (logErr) {
      console.error('Failed to log webhook payload:', logErr.message);
    }

    console.log(`Booking received: ${contactName} (${contactEmail}) → video: ${utms.utm_campaign || 'unknown'}, link: ${utms.utm_content || 'unknown'}, matched click: ${clickId ? 'yes' : 'no'}`);

    res.status(201).json({ status: 'created', booking_id: booking.id, attributed: !!linkId });
  } catch (err) { next(err); }
}

function extractUtms(payload) {
  const utms = {
    utm_source: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };

  const sources = [
    payload,
    payload.contact,
    payload.appointment,
    payload.custom_fields,
    payload.customFields,
    payload.attribution,
    payload.meta,
    payload.data,
  ].filter(Boolean);

  // Canonical variants for each UTM field
  const variants = {
    utm_source:   ['utm_source', 'utmsource', 'utmSource', 'Utm_Source', 'UTM_SOURCE'],
    utm_campaign: ['utm_campaign', 'utmcampaign', 'utmCampaign', 'Utm_Campaign', 'UTM_CAMPAIGN'],
    utm_content:  ['utm_content', 'utmcontent', 'utmContent', 'Utm_Content', 'UTM_CONTENT'],
    utm_term:     ['utm_term', 'utmterm', 'utmTerm', 'Utm_Term', 'UTM_TERM'],
  };

  for (const src of sources) {
    // Case-insensitive scan: build a lowercase→value map for this source
    const lcMap = {};
    for (const k of Object.keys(src)) {
      if (src[k] != null && src[k] !== '') lcMap[k.toLowerCase()] = src[k];
    }

    for (const [canonical, keys] of Object.entries(variants)) {
      if (!utms[canonical]) {
        for (const v of keys) {
          const val = src[v] || lcMap[v.toLowerCase()];
          if (val) { utms[canonical] = val; break; }
        }
      }
    }
  }

  const sourceUrl = payload.source_url || payload.sourceUrl || payload.page_url || payload.pageUrl;
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      for (const key of Object.keys(utms)) {
        if (!utms[key]) utms[key] = url.searchParams.get(key);
      }
    } catch {}
  }

  return utms;
}

module.exports = { handleGhlWebhook };
