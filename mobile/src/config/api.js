import axios from 'axios';

const API_BASE_URL = 'http://10.254.203.238:3000/api'; // Update this with your IP!

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.message);
        return Promise.reject(error);
    }
);

export default api;
