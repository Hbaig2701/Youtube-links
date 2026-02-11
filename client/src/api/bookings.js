import { api } from './client';

export const getVideoBookings = (videoId) => api.get(`/api/videos/${videoId}/bookings`);
export const getRecentBookings = () => api.get('/api/bookings/recent');
