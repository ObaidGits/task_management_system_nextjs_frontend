import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(cfg => {
  const token = getToken();
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status;
    let msg = 'Something went wrong';
    if (status === 401) {
      msg = 'Session expired. Please log in again.';
      removeToken();
    } else if (err.response?.data?.message) {
      msg = err.response.data.message;
    } else if (!err.response) {
      msg = 'No response from server.';
    }
    return Promise.reject({ message: msg });
  }
);

export default api;
