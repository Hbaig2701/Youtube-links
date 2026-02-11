function buildRedirectUrl(destinationUrl, { videoSlug, linkLabel, sessionId }) {
  const url = new URL(destinationUrl);
  url.searchParams.set('utm_source', 'youtube');
  url.searchParams.set('utm_medium', 'video_description');
  url.searchParams.set('utm_campaign', videoSlug);
  url.searchParams.set('utm_content', linkLabel);
  if (sessionId) url.searchParams.set('utm_term', sessionId);
  return url.toString();
}

module.exports = buildRedirectUrl;
