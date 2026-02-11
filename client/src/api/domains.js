import { api } from './client';

export const getDomains = () => api.get('/api/domains');
export const createDomain = (data) => api.post('/api/domains', data);
export const updateDomain = (id, data) => api.put(`/api/domains/${id}`, data);
export const deleteDomain = (id) => api.del(`/api/domains/${id}`);
