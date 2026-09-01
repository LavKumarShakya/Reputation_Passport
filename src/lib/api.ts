import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle global API errors (e.g., expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is expired or invalid. Clear it and redirect to login.
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // We use window.location here because this is outside the React Router context
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
