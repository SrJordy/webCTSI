import axios from 'axios';
import { toast } from 'react-hot-toast';

interface HistorialMedico {
    cod_historial: number;
    descripcion?: string;
    tipo_sangre?: string;
    presion_arterial: string;
    peso: number;
    estatura: number;
    temperatura?: number;
    nivel_glucosa?: number;
    fecha: Date;
    profesional_id: number;
    persona_id: number;
    estado: boolean;
    profesional?: {
        cod_usuario: number;
        nombre: string;
        apellido: string;
    };
    persona?: {
        cod_paciente: number;
        nombre: string;
        apellido: string;
    };
    diagnostico?: Diagnostico[];
    tratamiento?: Tratamiento[];
    examenes?: Examen[];
}

interface Diagnostico {
    cod_diagnostico: number;
    descripcion: string;
    fecha_diagnostico: Date;
    historial_id: number;
}

interface Tratamiento {
    cod_tratamiento: number;
    descripcion: string;
    fechainicio: Date;
    fechafin: Date;
    historial_id: number;
}

interface Examen {
    cod_examen: number;
    tipo: string;
    resultados: string;
    fecha: Date;
    historial_id: number;
}

interface CreateHistorialMedicoDTO {
    descripcion?: string;
    tipo_sangre?: string;
    presion_arterial: string;
    peso: number;
    estatura: number;
    temperatura?: number;
    nivel_glucosa?: number;
    fecha: Date;
    profesional_id: number;
    persona_id: number;
}

class HistoryServiceError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'HistoryServiceError';
    }
}
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/ApiHistorial`;


export const HistoryService = {
    async getAllHistories(): Promise<HistorialMedico[]> {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching medical histories:', error);
            toast.error('Error al obtener los historiales médicos');
            throw new HistoryServiceError('Error al obtener los historiales médicos', 'FETCH_ERROR');
        }
    },

    async getHistory(id: number): Promise<HistorialMedico> {
        try {
            const response = await axios.get(`${BASE_URL}?id=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching medical history:', error);
            toast.error('Error al obtener el historial médico');
            throw new HistoryServiceError('Error al obtener el historial médico', 'FETCH_ERROR');
        }
    },

    async checkPatientHistory(personaId: number): Promise<boolean> {
        try {
            const histories = await this.getAllHistories();
            return histories.some(history => 
                history.persona_id === personaId && history.estado === true
            );
        } catch (error) {
            console.error('Error checking patient history:', error);
            toast.error('Error al verificar el historial médico');
            throw new HistoryServiceError('Error al verificar el historial médico', 'CHECK_ERROR');
        }
    },

    async createHistory(data: CreateHistorialMedicoDTO): Promise<HistorialMedico> {
        try {
            if (!data.presion_arterial || !data.peso || !data.estatura || 
                !data.fecha || !data.profesional_id || !data.persona_id) {
                throw new HistoryServiceError('Los campos obligatorios son requeridos', 'VALIDATION_ERROR');
            }

            if (data.peso <= 0 || data.peso > 500) {
                throw new HistoryServiceError('El peso debe estar entre 0 y 500 kg', 'VALIDATION_ERROR');
            }

            if (data.estatura <= 0 || data.estatura > 300) {
                throw new HistoryServiceError('La estatura debe estar entre 0 y 300 cm', 'VALIDATION_ERROR');
            }

            if (data.temperatura && (data.temperatura < 35 || data.temperatura > 42)) {
                throw new HistoryServiceError('La temperatura debe estar entre 35°C y 42°C', 'VALIDATION_ERROR');
            }

            const response = await axios.post(BASE_URL, {
                ...data,
                fecha: new Date(data.fecha)
            });

            toast.success('Historial médico creado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error creating medical history:', error);
            if (error instanceof HistoryServiceError) {
                toast.error(error.message);
                throw error;
            }
            toast.error('Error al crear el historial médico');
            throw new HistoryServiceError('Error al crear el historial médico', 'CREATE_ERROR');
        }
    },

    async updateHistory(
        id: number, 
        data: Partial<CreateHistorialMedicoDTO>
    ): Promise<HistorialMedico> {
        try {
            if (data.peso && (data.peso <= 0 || data.peso > 500)) {
                throw new HistoryServiceError('El peso debe estar entre 0 y 500 kg', 'VALIDATION_ERROR');
            }

            if (data.estatura && (data.estatura <= 0 || data.estatura > 300)) {
                throw new HistoryServiceError('La estatura debe estar entre 0 y 300 cm', 'VALIDATION_ERROR');
            }

            if (data.temperatura && (data.temperatura < 35 || data.temperatura > 42)) {
                throw new HistoryServiceError('La temperatura debe estar entre 35°C y 42°C', 'VALIDATION_ERROR');
            }

            const response = await axios.put(`${BASE_URL}?id=${id}`, {
                ...data,
                fecha: data.fecha ? new Date(data.fecha) : undefined
            });

            toast.success('Historial médico actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error updating medical history:', error);
            toast.error('Error al actualizar el historial médico');
            throw new HistoryServiceError('Error al actualizar el historial médico', 'UPDATE_ERROR');
        }
    },

    async deleteHistory(id: number): Promise<void> {
        try {
            await axios.delete(`${BASE_URL}?id=${id}`);
            toast.success('Historial médico eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting medical history:', error);
            toast.error('Error al eliminar el historial médico');
            throw new HistoryServiceError('Error al eliminar el historial médico', 'DELETE_ERROR');
        }
    },

    async getPatientHistory(personaId: number): Promise<HistorialMedico[]> {
        try {
            const histories = await this.getAllHistories();
            return histories.filter(history => 
                history.persona_id === personaId && history.estado === true
            );
        } catch (error) {
            console.error('Error fetching patient history:', error);
            toast.error('Error al obtener el historial del paciente');
            throw new HistoryServiceError('Error al obtener el historial del paciente', 'FETCH_ERROR');
        }
    }
};

export default HistoryService;