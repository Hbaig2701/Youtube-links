import { api } from './client';

export const getDevices = (videoId) => api.get(`/api/analytics/devices${videoId ? `?videoId=${videoId}` : ''}`);
export const getGeo = (videoId) => api.get(`/api/analytics/geo${videoId ? `?videoId=${videoId}` : ''}`);
export const getVideoClicks = (videoId, range = '30d') => api.get(`/api/videos/${videoId}/clicks?range=${range}`);
