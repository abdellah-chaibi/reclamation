import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── Attach bearer token on every request ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Global 401 handler ───────────────────────────────────────────────────
// If any request gets a 401 (token expired / invalid), clear local storage
// and broadcast a logout event so AuthContext can reset user state cleanly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/user'),
};

// ─── Reclamations ──────────────────────────────────────────────────────────
export const reclamationService = {
  getAll:  (params)       => api.get('/reclamations', { params }),
  getMy:   (userId, params) => api.get('/reclamations', { params: { ...params, user_id: userId } }),
  getById: (id)           => api.get(`/reclamations/${id}`),
  create:  (data)         => api.post('/reclamations', data),
  createWithMedia: (data) => api.post('/reclamations', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update:  (id, data)     => api.put(`/reclamations/${id}`, data),
  refuse:  (id, data)     => api.patch(`/reclamations/${id}/refuse`, data),
  delete:  (id)           => api.delete(`/reclamations/${id}`),
};

// ─── Departements ──────────────────────────────────────────────────────────
export const departementService = {
  getAll:  (params)   => api.get('/departements', { params }),
  getById: (id)       => api.get(`/departements/${id}`),
  create:  (data)     => api.post('/departements', data),
  update:  (id, data) => api.put(`/departements/${id}`, data),
  delete:  (id)       => api.delete(`/departements/${id}`),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const userService = {
  getAll:  (params)   => api.get('/users', { params }),
  getById: (id)       => api.get(`/users/${id}`),
  create:  (data)     => api.post('/users', data),
  update:  (id, data) => api.put(`/users/${id}`, data),
  delete:  (id)       => api.delete(`/users/${id}`),
};

export default api;
