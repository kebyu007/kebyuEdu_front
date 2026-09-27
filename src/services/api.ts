import axios from 'axios';
import toast from 'react-hot-toast';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:3001/api/v1`
  : 'http://localhost:3001/api/v1');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // If login or refresh fails with 401, don't loop
        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
           if (error.response?.data?.message) {
             const msg = error.response.data.message;
             toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
           } else {
             toast.error("Ruxsat etilmadi (401)");
           }
           return Promise.reject(error);
        }
        
        if (refreshToken) {
          if (isRefreshing) {
            return new Promise(function(resolve, reject) {
              failedQueue.push({resolve, reject})
            }).then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axios(originalRequest).then(res => res.data); // Need to resolve with data since we use response.data interceptor
            }).catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call refresh endpoint directly with axios to bypass interceptor
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
              headers: { 'Authorization': `Bearer ${refreshToken}` }
            });
            
            const newToken = res.data.access_token;
            const newRefresh = res.data.refresh_token;
            
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('refresh_token', newRefresh);
            
            processQueue(null, newToken);
            
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return axios(originalRequest).then(res => res.data);
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            toast.error("Sessiya eskirgan. Iltimos, qaytadan kiring!");
            setTimeout(() => { window.location.href = '/login'; }, 1000);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token available
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          toast.error("Sessiya eskirgan. Iltimos, qaytadan kiring!");
          setTimeout(() => { window.location.href = '/login'; }, 1000);
        }
      }
    } else if (error.response?.data?.message) {
      // Backend sent a specific error message
      const msg = error.response.data.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg);
      }
    } else {
      // General network error or something else
      toast.error("Tarmoq xatosi yoki server ishlamayapti!");
    }
    return Promise.reject(error);
  }
);

export default api;
