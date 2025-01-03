import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const RECORDATORIO_URL = `${API_URL}/ApiRecordatorio`;

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

interface RecordatorioData {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
}

export const createRecordatorio = async (recordatorioData: RecordatorioData): Promise<any> => {
    try {
        console.log('Creando recordatorio:', recordatorioData);
        const response = await axios.post(RECORDATORIO_URL, recordatorioData, axiosConfig);
        console.log('Recordatorio creado exitosamente:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el recordatorio:", error);
        if (axios.isAxiosError(error)) {
            console.error("Respuesta del servidor:", error.response?.data);
            console.error("Estado de la respuesta:", error.response?.status);
        }
        throw new Error("Error al crear el recordatorio");
    }
};