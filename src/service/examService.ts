import axios from 'axios';
import { Examen, ExamenCreate, ExamenUpdate } from '../assets/Examenes';

const API_URL = import.meta.env.VITE_API_URL;

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

export const ExamenService = {
    getAllExamenes: async (): Promise<Examen[]> => {
        const response = await axios.get(`${API_URL}/getAllExam`, axiosConfig);
        return response.data;
    },

    getExamen: async (id: number): Promise<Examen> => {
        const response = await axios.get(`${API_URL}/getExam?id=${id}`, axiosConfig);
        return response.data;
    },

    createExamen: async (data: ExamenCreate): Promise<Examen> => {
        const response = await axios.post(`${API_URL}/createExam`, data, axiosConfig);
        return response.data;
    },

    updateExamen: async (id: number, data: ExamenUpdate): Promise<Examen> => {
        const response = await axios.put(`${API_URL}/updateExam?id=${id}`, data, axiosConfig);
        return response.data;
    },

    deleteExamen: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/deleteExam?id=${id}`, axiosConfig);
    }
};