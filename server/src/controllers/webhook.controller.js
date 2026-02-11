const bookingModel = require('../models/booking.model');
const linkModel = require('../models/link.model');
const clickModel = require('../models/click.model');
const settingModel = require('../models/setting.model');
const db = require('../db/connection');

function handleGhlWebhook(req, res) {
  // Verify webhook secret if configured
  const secret = settingModel.get('ghl_webhook_secret');
  if (secret) {
    const provided = req.headers['x-webhook-secret'] || req.query.secret;
    if (provided !== secret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
  }

  const payload = req.body;

  // GHL sends different event types
  // Common fields: contact info, appointment info, custom fields with UTMs
  const eventType = payload.type || payload.event || 'appointment.created';

  // Extract contact info — GHL payloads vary, try common paths
  const contact = payload.contact || payload;
  const appointment = payload.appointment || payload.calendar || payload;

  const contactName = contact.name || contact.full_name
    || [contact.first_name || contact.firstName, contact.last_name || contact.lastName].filter(Boolean).join(' ')
    || 'Unknown';
  const contactEmail = contact.email || contact.contact_email || null;
  const ghlContactId = contact.id || contact.contact_id || contact.contactId || null;
  const ghlBookingId = appointment.id || appointment.appointment_id || appointment.appointmentId
    || payload.id || null;
  const appointmentTime = appointment.start_time || appointment.startTime
    || appointment.selected_slot || appointment.selectedTimeslot || null;

  // Extract UTM data — GHL stores UTMs in various places
  const utms = extractUtms(payload);

  // Handle status updates for existing bookings
  if (eventType.includes('cancelled') || eventType.includes('canceled')) {
    if (ghlBookingId) {
      const existing = bookingModel.findByGhlBookingId(String(ghlBookingId));
      if (existing) {
        bookingModel.updateStatus(String(ghlBookingId), 'cancelled');
        return res.json({ status: 'updated', booking_id: existing.id });
      }
    }
  }

  if (eventType.includes('completed') || eventType.includes('showed')) {
    if (ghlBookingId) {
      const existing = bookingModel.findByGhlBookingId(String(ghlBookingId));
      if (existing) {
        bookingModel.updateStatus(String(ghlBookingId), 'completed');
        return res.json({ status: 'updated', booking_id: existing.id });
      }
    }
  }

  if (eventType.includes('no-show') || eventType.includes('noshow') || eventType.includes('no_show')) {
    if (ghlBookingId) {
      const existing = bookingModel.findByGhlBookingId(String(ghlBookingId));
      if (existing) {
        bookingModel.updateStatus(String(ghlBookingId), 'no-show');
        return res.json({ status: 'updated', booking_id: existing.id });
      }
    }
  }

  // Skip if we already have this booking
  if (ghlBookingId) {
    const existing = bookingModel.findByGhlBookingId(String(ghlBookingId));
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
    const click = db.prepare('SELECT * FROM clicks WHERE session_id = ?').get(utms.utm_term);
    if (click) {
      clickId = click.id;
      linkId = click.link_id;
      const clickTime = new Date(click.clicked_at + 'Z').getTime();
      const bookTime = Date.now();
      timeToBookSeconds = Math.round((bookTime - clickTime) / 1000);
    }
  }

  // Fallback: utm_campaign (video slug) + utm_content (link label)
  if (!linkId && utms.utm_campaign && utms.utm_content) {
    const link = linkModel.findByVideoSlugAndLabel(utms.utm_campaign, utms.utm_content);
    if (link) {
      linkId = link.id;
    }
  }

  const booking = bookingModel.create({
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

  console.log(`Booking received: ${contactName} (${contactEmail}) → video: ${utms.utm_campaign || 'unknown'}, link: ${utms.utm_content || 'unknown'}, matched click: ${clickId ? 'yes' : 'no'}`);

  res.status(201).json({ status: 'created', booking_id: booking.id, attributed: !!linkId });
}

// GHL stores UTMs in various places depending on the setup
function extractUtms(payload) {
  const utms = {
    utm_source: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };

  // Direct UTM fields
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

  for (const src of sources) {
    for (const key of Object.keys(utms)) {
      if (!utms[key]) {
        utms[key] = src[key] || src[key.replace(/_/g, '')] || null;
      }
    }
    // Also check camelCase variants
    if (!utms.utm_source) utms.utm_source = src.utmSource || null;
    if (!utms.utm_campaign) utms.utm_campaign = src.utmCampaign || null;
    if (!utms.utm_content) utms.utm_content = src.utmContent || null;
    if (!utms.utm_term) utms.utm_term = src.utmTerm || null;
  }

  // Check URL params if a source URL is provided
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
