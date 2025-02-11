import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface RecordatorioData {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
    pacienteNombre?: string; 
    medicamentoNombre?: string; 
}

interface NotificacionData {
    type: string;
    title: string;
    message: string;
    playerId: string;
    scheduledTime: string;
}

const createNotificacion = async (notificacionData: NotificacionData): Promise<void> => {
    try {
        console.log('Creando notificación:', notificacionData);
        const response = await axios.post(`${API_URL}/notifications`, notificacionData);
        console.log('Notificación creada exitosamente:', response.data);
    } catch (error) {
        console.error("Error al crear la notificación:", error);
        if (axios.isAxiosError(error)) {
            console.error("Respuesta del servidor:", error.response?.data);
            console.error("Estado de la respuesta:", error.response?.status);
        }
        throw new Error("Error al crear la notificación");
    }
};

export const createRecordatorio = async (recordatorioData: RecordatorioData, playerId: string): Promise<RecordatorioData> => {
    try {
        console.log('Creando recordatorio:', recordatorioData);
        const response = await axios.post(`${API_URL}/createReminder`, recordatorioData);
        console.log('Recordatorio creado exitosamente:', response.data);

        const pacienteNombre = await getPacienteNombre(recordatorioData.persona_id);
        const medicamentoNombre = await getMedicamentoNombre(recordatorioData.medicamento_id);

        const options = { 
            year: 'numeric' as const, 
            month: 'long' as const, 
            day: 'numeric' as const, 
            hour: '2-digit' as const, 
            minute: '2-digit' as const, 
            hour12: false, 
            timeZone: 'America/Guayaquil' 
        };
        const formattedDate = recordatorioData.fechahora.toLocaleString('es-EC', options);

        const notificacionData: NotificacionData = {
            type: "scheduled",
            title: `Recordatorio de medicamento del paciente ${pacienteNombre}`,
            message: `El paciente ${pacienteNombre} debe tomar su medicamento ${medicamentoNombre} a las ${formattedDate}.`,
            playerId: playerId, 
            scheduledTime: recordatorioData.fechahora.toISOString(), 
        };

        await createNotificacion(notificacionData);

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

const getPacienteNombre = async (personaId: number): Promise<string> => {
    try {
        const response = await axios.get(`${API_URL}/patient?id=${personaId}`);
        return response.data.nombre; 
    } catch (error) {
        console.error("Error al obtener el nombre del paciente:", error);
        throw new Error("Error al obtener el nombre del paciente");
    }
};

const getMedicamentoNombre = async (medicamentoId: number): Promise<string> => {
    try {
        const response = await axios.get(`${API_URL}/medication?id=${medicamentoId}`);
        return response.data.nombre;
    } catch (error) {
        console.error("Error al obtener el nombre del medicamento:", error);
        throw new Error("Error al obtener el nombre del medicamento");
    }
};

export const deleteRecordatorio = async (id: number): Promise<void> => {
    try {
        console.log('Eliminando recordatorio:', id);
        const response = await axios.delete(`${API_URL}/deleteFisico?id=${id}`);
        console.log('Recordatorio eliminado exitosamente:', response.data);
    } catch (error) {
        console.error("Error al eliminar el recordatorio:", error);
        if (axios.isAxiosError(error)) {
            console.error("Respuesta del servidor:", error.response?.data);
            console.error("Estado de la respuesta:", error.response?.status);
        }
        throw new Error("Error al eliminar el recordatorio");
    }
};