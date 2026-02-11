import { api } from './client';

export const getDevices = (videoId) => api.get(`/api/analytics/devices${videoId ? `?videoId=${videoId}` : ''}`);
export const getGeo = (videoId) => api.get(`/api/analytics/geo${videoId ? `?videoId=${videoId}` : ''}`);
export const getVideoClicks = (videoId, range = '30d', { startDate, endDate, linkId } = {}) => {
  const params = new URLSearchParams({ range });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  if (linkId) params.set('link_id', linkId);
  return api.get(`/api/videos/${videoId}/clicks?${params}`);
};
