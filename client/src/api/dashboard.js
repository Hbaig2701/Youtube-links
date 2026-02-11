import { api } from './client';

export const getSummary = () => api.get('/api/dashboard/summary');
export const getClicksOverTime = (range = '7d', { startDate, endDate } = {}) => {
  const params = new URLSearchParams({ range });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  return api.get(`/api/dashboard/clicks-over-time?${params}`);
};
