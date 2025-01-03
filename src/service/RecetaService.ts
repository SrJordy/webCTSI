import axios from "axios";
import { createRecordatorio } from './RecordatorioService';

const API_URL = import.meta.env.VITE_API_URL;
const RECETA_URL = `${API_URL}/ApiReceta`;
const MEDICAMENTO_URL = `${API_URL}/ApiMedicamento`;
const RECORDATORIO_URL = `${API_URL}/ApiRecordatorio`;

interface Recordatorio {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
}

interface Medicamento {
    nombre: string;
    descripcion: string;
    frecuenciamin: number;
    cantidadtotal: number;
    receta_id: number;
}

interface RecetaData {
    persona_id: number;
    profesional_id: number;
}

export const getAllRecetas = async (): Promise<any> => {
    try {
        const response = await axios.get(RECETA_URL, axiosConfig);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las recetas", error);
        throw new Error("Error al obtener las recetas");
    }
};

export const getReceta = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${RECETA_URL}?id=${id}`, axiosConfig);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la receta", error);
        throw new Error("Error al obtener la receta");
    }
};

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

export const createReceta = async (
    recetaData: RecetaData,
    medicamentos: Array<Medicamento>,
    recordatorios: Array<Omit<Recordatorio, 'medicamento_id'>>
): Promise<any> => {
    try {
        // 1. Crear la receta
        const recetaResponse = await axios.post(RECETA_URL, recetaData, axiosConfig);
        const cod_receta = recetaResponse.data.cod_receta;

        // 2. Crear los medicamentos asociados a la receta
        const medicamentosCreados = [];
        for (const medicamento of medicamentos) {
            const medicamentoData = {
                ...medicamento,
                receta_id: cod_receta
            };
            const medicamentoResponse = await axios.post(MEDICAMENTO_URL, medicamentoData, axiosConfig);
            const cod_medicamento = medicamentoResponse.data.cod_medicamento;
            medicamentosCreados.push({
                cod_medicamento,
                ...medicamento
            });
        }

        // 3. Crear los recordatorios para cada medicamento usando el nuevo servicio
        for (let i = 0; i < medicamentosCreados.length; i++) {
            const recordatoriosParaMedicamento = recordatorios[i];
            if (recordatoriosParaMedicamento) {
                const recordatorioData = {
                    medicamento_id: medicamentosCreados[i].cod_medicamento,
                    fechahora: recordatoriosParaMedicamento.fechahora,
                    persona_id: recetaData.persona_id,
                    estado: true
                };
                await createRecordatorio(recordatorioData);
            }
        }

        return {
            receta: recetaResponse.data,
            medicamentos: medicamentosCreados
        };
    } catch (error) {
        console.error("Error al crear la receta:", error);
        throw error;
    }
};

export const updateReceta = async (id: number, data: any): Promise<any> => {
    try {
        const response = await axios.put(`${RECETA_URL}?id=${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la receta", error);
        throw new Error("Error al actualizar la receta");
    }
};

export const deleteReceta = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(`${RECETA_URL}?id=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la receta", error);
        throw new Error("Error al eliminar la receta");
    }
};