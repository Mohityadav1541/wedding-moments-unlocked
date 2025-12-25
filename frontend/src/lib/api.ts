import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 60000, // 60s timeout for AI operations
});

// Add interceptor to include token in headers if it exists
api.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Automatic Logout on 401 (Invalid/Expired Token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear invalid token
            localStorage.removeItem('user');
            // Redirect to login (if not already there)
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// ... existing imports

export const getLandingContent = async () => {
    const response = await api.get('/content');
    return response.data;
};

export const getPhotographers = async () => {
    const response = await api.get('/users/photographers');
    return response.data;
};

export const getRevenueStats = async () => {
    const response = await api.get('/events/revenue');
    return response.data;
};

export const updateUserStatus = async (userId: string, isBlocked: boolean) => {
    const response = await api.put(`/users/${userId}/status`, { isBlocked });
    return response.data;
};

export const deleteUser = async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export default api;
