import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const hasAuthToken = () => Boolean(localStorage.getItem('token'));

export const redirectToSignIn = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.setItem('teamflow:authMode', 'signin');
  window.history.pushState({}, '', '/');
  window.dispatchEvent(new Event('teamflow:navigate'));
};

// Interceptors for adding auth token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToSignIn();
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginUser = (data) => API.post('/auth/signin', data);
export const registerUser = (data) => API.post('/auth/signup', data);
export const getProfile = () => API.get('/auth/me');
export const searchUsers = (search) => API.get('/auth/users', { params: { search } });

// Project APIs
export const createProject = (data) => API.post('/projects', data);
export const getProjects = () => API.get('/projects');
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addProjectMember = (id, data) => API.post(`/projects/${id}/members`, data);
export const removeProjectMember = (id, userId) => API.delete(`/projects/${id}/members/${userId}`);

// Task APIs
export const createTask = (data) => API.post('/tasks', data);
export const getTasks = (params) => API.get('/tasks', { params });
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Team APIs
export const createTeam = (data) => API.post('/teams', data);
export const getTeams = () => API.get('/teams');
export const getTeamById = (id) => API.get(`/teams/${id}`);
export const updateTeam = (id, data) => API.put(`/teams/${id}`, data);
export const deleteTeam = (id) => API.delete(`/teams/${id}`);
export const addTeamMember = (id, data) => API.post(`/teams/${id}/members`, data);
export const removeTeamMember = (id, userId) => API.delete(`/teams/${id}/members/${userId}`);

export default API;
