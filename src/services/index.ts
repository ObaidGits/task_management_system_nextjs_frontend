import api from './api';

interface User {
  _id: string;
  role: string;
}

// export const authService = {
//   login: (data: any) => api.post('/auth/login', data),
//   register: (data: any) => api.post('/auth/register', data),
//   logout: () => api.post('/auth/logout'),
//   getProfile: () => api.get('/users/profile'),
// };

export const authService = {
  login: (data: any) => api.post('/auth/login', data, { withCredentials: true }),
  register: (data: any) => api.post('/auth/register', data, { withCredentials: true }),
  logout: () => api.post('/auth/logout', null, { withCredentials: true }),
  getProfile: () => api.get('/users/profile', { withCredentials: true }),
};


export const taskService = {
  list: (params = {}) => api.get('/tasks', { params }).then(r => r.data),
  create: (t: any) => api.post('/tasks', t).then(r => r.data),
  update: (id: string, t: any) => api.put(`/tasks/${id}`, t).then(r => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data), // 👈 NEW
};


export const analyticsService = {
  stats: (user: User) => {
    return api.get(`/analytics/stats/${user._id}`).then(r => r.data);
  },
};

export const logService = {
  list: (user: User) => {
    return api.get(`/logs?role=${user.role}&_id=${user._id}`).then(r => r.data);
  },
};

export const notificationService = {
  getAll: (user: User) => api.get(`/notifications`).then(res => res.data),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`).then(res => res.data),
};

export const userService = {
  list: () => api.get('/users').then(r => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
};
