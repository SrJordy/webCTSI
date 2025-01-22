import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface RecordatorioData {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
}

export const createRecordatorio = async (recordatorioData: RecordatorioData): Promise<RecordatorioData> => {
    try {
        console.log('Creando recordatorio:', recordatorioData);
        const response = await axios.post(`${API_URL}/createReminder`, recordatorioData);
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