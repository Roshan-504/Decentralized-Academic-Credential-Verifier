import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token automatically if available
API.interceptors.request.use((req) => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed?.token) {
        req.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // Ignore invalid JSON in localStorage
  }
  return req;
});

export default API;