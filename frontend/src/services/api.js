import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5005/api' });

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login:    (data) => api.post('/auth/login', data),
};

export const quizService = {
    getAll:        (params) => api.get('/quizzes', { params }),
    getById:       (id)     => api.get(`/quizzes/${id}`),
    create:        (data)   => api.post('/quizzes', data),
    delete:        (id)     => api.delete(`/quizzes/${id}`),
    getUserQuizzes:()       => api.get('/quizzes/user/created'),
    getReports:    (id)     => api.get(`/quizzes/${id}/reports`),
};

export const attemptService = {
    submit:         (data) => api.post('/attempts', data),
    getUserAttempts:()     => api.get('/attempts/user'),
};

export default api;
