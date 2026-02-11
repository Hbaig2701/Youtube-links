import { api } from './client';

export const getTemplates = () => api.get('/api/templates');
export const createTemplate = (data) => api.post('/api/templates', data);
export const updateTemplate = (id, data) => api.put(`/api/templates/${id}`, data);
export const deleteTemplate = (id) => api.del(`/api/templates/${id}`);
export const applyTemplates = (videoId, templateIds) => api.post(`/api/videos/${videoId}/apply-templates`, { template_ids: templateIds });
