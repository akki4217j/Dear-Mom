import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dearMomToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dearMomToken');
      localStorage.removeItem('dearMomUser');
      // Only redirect if not already on auth pages
      if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ──────── AUTH ────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  linkPartner: (partnerCode) => API.post('/auth/link-partner', { partnerCode }),
};

// ──────── MOODS ────────
export const moodAPI = {
  getAll: () => API.get('/moods'),
  save: (data) => API.post('/moods', data),
  getStats: () => API.get('/moods/stats'),
  getPartnerMoods: () => API.get('/moods/partner'),
};

// ──────── TASKS ────────
export const taskAPI = {
  getByDate: (date) => API.get(`/tasks/${date}`),
  saveByDate: (date, completedTasks) => API.put(`/tasks/${date}`, { completedTasks }),
  getWeeklyStats: () => API.get('/tasks/stats/week'),
  getStreak: (totalTasks) => API.get(`/tasks/stats/streak?totalTasks=${totalTasks}`),
};

// ──────── MEMORIES ────────
export const memoryAPI = {
  getAll: () => API.get('/memories'),
  create: (formData) => API.post('/memories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/memories/${id}`),
};

// ──────── GAMES ────────
export const gameAPI = {
  getLikedNames: () => API.get('/games/liked-names'),
  addLikedName: (data) => API.post('/games/liked-names', data),
  getQuizAnswers: () => API.get('/games/quiz-answers'),
  saveQuizAnswers: (answers) => API.post('/games/quiz-answers', { answers }),
  resetQuizAnswers: () => API.delete('/games/quiz-answers'),
};

// ──────── PUZZLES ────────
export const puzzleAPI = {
  getAll: (params) => API.get('/puzzles', { params }),
  getRandom: (difficulty) => API.get('/puzzles/random', { params: { difficulty } }),
  startGame: (puzzleId) => API.post('/puzzles/start-game', { puzzleId }),
  getSession: (id) => API.get(`/puzzles/session/${id}`),
  getSessions: () => API.get('/puzzles/sessions'),
  placeMove: (id, data) => API.post(`/puzzles/session/${id}/move`, data),
};

export default API;
