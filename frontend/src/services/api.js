import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_URL,
});

export const generateQuiz = async (url) => {
    const response = await api.post('/generate', { url });
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get('/history');
    return response.data;
};

export const getQuiz = async (id) => {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
};

export const deleteQuiz = async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
};
