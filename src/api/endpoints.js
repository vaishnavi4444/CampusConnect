import client from './client';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const eventsAPI = {
  getAll: (params) => client.get('/events', { params }),
  getById: (id) => client.get(`/events/${id}`),
  create: (data) => client.post('/events', data),
  update: (id, data) => client.put(`/events/${id}`, data),
  delete: (id) => client.delete(`/events/${id}`),
  publish: (id) => client.put(`/events/${id}/publish`),
  getEnrolled: () => client.get('/events/enrolled'),
};

// ─── Registrations ───────────────────────────────────────────────────────────

export const registrationAPI = {
  register: (eventId) => client.post(`/events/${eventId}/register`),
  cancel: (eventId) => client.delete(`/events/${eventId}/register`),
};

// ─── Check-in ────────────────────────────────────────────────────────────────

export const checkinAPI = {
  validate: (data) => client.post('/checkin', data),
  confirm: (data) => client.post('/checkin/confirm', data),
  getAttended: (eventId) => client.get(`/checkin/attended/${eventId}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsAPI = {
  getAll: () => client.get('/notifications'),
  markRead: (id) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
};

// ─── Error helper ────────────────────────────────────────────────────────────

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message === 'Network Error') return 'No internet connection';
  if (error.code === 'ECONNABORTED') return 'Request timed out';
  return 'Something went wrong. Please try again.';
};
