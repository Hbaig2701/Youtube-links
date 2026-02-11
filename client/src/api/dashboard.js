import { api } from './client';

export const getSummary = () => api.get('/api/dashboard/summary');
export const getClicksOverTime = (range = '7d') => api.get(`/api/dashboard/clicks-over-time?range=${range}`);
