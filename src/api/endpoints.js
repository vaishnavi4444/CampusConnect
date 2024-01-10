import client from './client';

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

export const eventsAPI = {
  getAll: (params) => client.get('/events', { params }),
  getById: (id) => client.get(`/events/${id}`),
  create: (data) => client.post('/events', data),
  update: (id, data) => client.put(`/events/${id}`, data),
  delete: (id) => client.delete(`/events/${id}`),
  publish: (id) => client.put(`/events/${id}/publish`),
  enrolled: () => client.get(`/events/enrolled`), 

  getMyEvents: () => client.get('/events/my'), 

  getMyRegistration: (eventId) => client.get(`/events/registrations/${eventId}`), 

  getStats:        (id) => client.get(`/events/${id}/stats`),
  getParticipants: (id) => client.get(`/events/${id}/participants`),

};

export const registrationAPI = {
  register: (eventId) => client.post(`/events/${eventId}/register`),
  cancel: (eventId) => client.delete(`/events/${eventId}/register`),
};

export const checkinAPI = {
  validate: (data) => client.post('/checkin', data),
  confirm: (data) => client.post('/checkin/confirm', data),
};

export const notificationsAPI = {
  getAll: () => client.get('/notifications'),
  markRead: (id) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message === 'Network Error') return 'No internet connection';
  if (error.code === 'ECONNABORTED') return 'Request timed out';
  return 'Something went wrong. Please try again.';
};

