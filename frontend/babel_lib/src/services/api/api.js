import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';  // Adjust this to your Django server's URL

const api = axios.create({
  baseURL: API_URL,
});

export const getUsers = () => api.get('users/');
export const getUserById = (id) => api.get(`users/${id}/`);
export const createUser = (userData) => api.post('users/', userData);
export const updateUser = (id, userData) => api.put(`users/${id}/`, userData);
export const deleteUser = (id) => api.delete(`users/${id}/`);

// Add more API calls for other endpoints as needed

export default api;
