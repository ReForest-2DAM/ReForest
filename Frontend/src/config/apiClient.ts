import axios from 'axios';
import { API_BASE_URL } from './config';

// Configurar axios con la base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default apiClient;
