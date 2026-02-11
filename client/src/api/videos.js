import { api } from './client';

export const getVideos = () => api.get('/api/videos');
export const getVideo = (id) => api.get(`/api/videos/${id}`);
export const createVideo = (data) => api.post('/api/videos', data);
export const updateVideo = (id, data) => api.put(`/api/videos/${id}`, data);
export const archiveVideo = (id) => api.del(`/api/videos/${id}`);
export const getVideoLinks = (id) => api.get(`/api/videos/${id}/links`);
export const createLink = (videoId, data) => api.post(`/api/videos/${videoId}/links`, data);
export const updateLink = (id, data) => api.put(`/api/links/${id}`, data);
export const deactivateLink = (id) => api.del(`/api/links/${id}`);
