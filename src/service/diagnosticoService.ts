import axios from 'axios';
import { Diagnostico, DiagnosticoCreate, DiagnosticoUpdate } from '../assets/Diagnosticos';

const API_URL = import.meta.env.VITE_API_URL;

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

export const DiagnosticoService = {
    getAllDiagnosticos: async (): Promise<Diagnostico[]> => {
        const response = await axios.get(`${API_URL}/getAllDiagnostic`, axiosConfig);
        return response.data;
    },

    getDiagnostico: async (id: number): Promise<Diagnostico> => {
        const response = await axios.get(`${API_URL}/getDiagnostic?id=${id}`, axiosConfig);
        return response.data;
    },

    createDiagnostico: async (data: DiagnosticoCreate): Promise<Diagnostico> => {
        const response = await axios.post(`${API_URL}/createDiagnostic`, data, axiosConfig);
        return response.data;
    },

    updateDiagnostico: async (id: number, data: DiagnosticoUpdate): Promise<Diagnostico> => {
        const response = await axios.put(`${API_URL}/updateDiagnostic?id=${id}`, data, axiosConfig);
        return response.data;
    },

    deleteDiagnostico: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/deleteDiagnostic?id=${id}`, axiosConfig);
    }
};