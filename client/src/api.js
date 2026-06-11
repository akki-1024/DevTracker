import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const projectsAPI = {
  getAll: (params) => API.get('/projects', { params }),
  getOne: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  uploadFiles: (id, formData) =>
    API.post(`/projects/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteFile: (id, fileId) => API.delete(`/projects/${id}/files/${fileId}`),
  getStats: () => API.get('/projects/meta/stats'),
};

export const clientsAPI = {
  getAll: () => API.get('/clients'),
  getOne: (id) => API.get(`/clients/${id}`),
  create: (data) => API.post('/clients', data),
  update: (id, data) => API.put(`/clients/${id}`, data),
  delete: (id) => API.delete(`/clients/${id}`),
};
