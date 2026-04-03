import axios from 'axios';

// Browser-safe base URL: uses /backend → proxied by Next.js to FastAPI on localhost:8000
// Server-side (Next.js API routes): can also override via NEXT_PUBLIC_API_URL if needed
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/backend';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null;
        const res = await axios.post(`${API_URL}/api/auth/refresh`, { token: refreshToken });
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.data.access_token);
        }
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(originalRequest);
      } catch (e) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
