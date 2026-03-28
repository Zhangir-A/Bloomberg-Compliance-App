import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response error handler
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Generic error handling - auth will be added in M5
    return Promise.reject(error);
  }
);

export default client;
