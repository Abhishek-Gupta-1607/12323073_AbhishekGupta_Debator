import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DebateRequest {
  topic: string;
  mode: string;
  rounds: number;
}

export const debateApi = {
  healthCheck: () => api.get('/health'),
  startDebate: (data: DebateRequest) => api.post('/debate', data),
  getDebates: () => api.get('/debates'),
  getDebate: (id: number) => api.get(`/debates/${id}`),
};
