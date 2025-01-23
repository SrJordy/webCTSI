import axios from "axios";
import { createRecordatorio, deleteRecordatorio } from './RecordatorioService';


const API_URL = import.meta.env.VITE_API_URL;
interface Recordatorio {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
}

interface Medicamento {
    cod_medicamento?: number;
    nombre: string;
    descripcion: string;
    frecuenciamin: number;
    cantidadtotal: number;
    receta_id?: number;
}

interface RecetaData {
    persona_id: number;
    profesional_id: number;
}

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

export const getAllRecetas = async (): Promise<RecetaData[]> => {
    try {
        const response = await axios.get(`${API_URL}/recipeall`, axiosConfig);
        console.log('Recetas:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las recetas", error);
        throw new Error("Error al obtener las recetas");
    }
};

export const getReceta = async (id: number): Promise<RecetaData[]> => {
    try {
        const response = await axios.get(`${API_URL}/recipe?id=${id}`, axiosConfig);
        console.log("datos de receta:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la receta", error);
        throw new Error("Error al obtener la receta");
    }
};

export const getRecetaConMedicamentos = async (id: number): Promise<RecetaData[]> => {
    try {
        const response = await axios.get(`${API_URL}/recipedetails?id=${id}`, axiosConfig);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la receta con medicamentos", error);
        throw new Error("Error al obtener la receta con medicamentos");
    }
};

export const createReceta = async (
    recetaData: RecetaData,
    medicamentos: Array<Medicamento>,
    recordatorios: Array<Omit<Recordatorio, 'medicamento_id'>>
): Promise<{ receta: RecetaData; medicamentos: Medicamento[] }> => {
    try {
        const recetaResponse = await axios.post(`${API_URL}/createrecipe`, recetaData, axiosConfig);
        const cod_receta = recetaResponse.data.cod_receta;

        const medicamentosCreados = await Promise.all(medicamentos.map(async (medicamento) => {
            const medicamentoData = {
                ...medicamento,
                receta_id: cod_receta
            };
            const medicamentoResponse = await axios.post(`${API_URL}/createMedication`, medicamentoData, axiosConfig);
            return {
                cod_medicamento: medicamentoResponse.data.cod_medicamento,
                ...medicamento
            };
        }));

        await Promise.all(medicamentosCreados.map(async (medicamento, index) => {
            const recordatoriosParaMedicamento = recordatorios[index];
            if (recordatoriosParaMedicamento) {
                const cantidadRecordatorios = medicamento.cantidadtotal;

                for (let i = 0; i < cantidadRecordatorios; i++) {
                    const fechaHora = new Date(recordatoriosParaMedicamento.fechahora);
                    fechaHora.setMinutes(fechaHora.getMinutes() + i * medicamento.frecuenciamin);

                    const recordatorioData = {
                        medicamento_id: medicamento.cod_medicamento,
                        fechahora: fechaHora,
                        persona_id: recetaData.persona_id,
                        estado: true
                    };
                    await createRecordatorio(recordatorioData);
                }
            }
        }));

        return {
            receta: recetaResponse.data,
            medicamentos: medicamentosCreados
        };
    } catch (error) {
        console.error("Error al crear la receta:", error);
        throw error;
    }
};

export const updateReceta = async (
    id: number,
    recetaData: RecetaData,
    medicamentos: Array<Medicamento & { recordatorioModificado?: boolean }>,
    recordatorios: Array<Omit<Recordatorio, 'medicamento_id'>>
): Promise<{ receta: RecetaData; medicamentos: Medicamento[] }> => {
    try {
        // 1. Actualizar la receta
        const recetaResponse = await axios.put(`${API_URL}/updaterecipe?id=${id}`, recetaData, axiosConfig);
        const cod_receta = recetaResponse.data.cod_receta;

        // 2. Procesar los medicamentos
        const medicamentosActualizados = await Promise.all(medicamentos.map(async (medicamento) => {
            const medicamentoData = {
                ...medicamento,
                receta_id: cod_receta
            };

            let medicamentoActualizado;

            if (medicamento.cod_medicamento) {
                // Actualizar medicamento existente
                medicamentoActualizado = await axios.put(
                    `${API_URL}/updateMedication?id=${medicamento.cod_medicamento}`,
                    medicamentoData,
                    axiosConfig
                );
            } else {
                // Crear nuevo medicamento
                medicamentoActualizado = await axios.post(
                    `${API_URL}/createMedication`,
                    medicamentoData,
                    axiosConfig
                );
            }

            return {
                cod_medicamento: medicamentoActualizado.data.cod_medicamento,
                ...medicamento
            };
        }));

        // 3. Procesar los recordatorios
        await Promise.all(medicamentosActualizados.map(async (medicamento, index) => {
            const recordatorioActual = recordatorios[index];

            // Solo procesar si el recordatorio fue modificado
            if (medicamento.recordatorioModificado && medicamento.cod_medicamento) {
                // Eliminar recordatorios existentes
                await deleteRecordatorio(medicamento.cod_medicamento);

                // Crear nuevos recordatorios
                const cantidadRecordatorios = medicamento.cantidadtotal;

                for (let i = 0; i < cantidadRecordatorios; i++) {
                    const fechaHora = new Date(recordatorioActual.fechahora);
                    fechaHora.setMinutes(fechaHora.getMinutes() + i * medicamento.frecuenciamin);

                    const recordatorioData = {
                        medicamento_id: medicamento.cod_medicamento,
                        fechahora: fechaHora,
                        persona_id: recetaData.persona_id,
                        estado: true
                    };
                    await createRecordatorio(recordatorioData);
                }
            }
        }));

        return {
            receta: recetaResponse.data,
            medicamentos: medicamentosActualizados
        };
    } catch (error) {
        console.error("Error al actualizar la receta:", error);
        throw error;
    }
};

export const deleteReceta = async (id: number): Promise<void> => {
    try {
        const recetaResponse = await axios.get(`${API_URL}/recipedetails?id=${id}`, axiosConfig);
        const medicamentos = recetaResponse.data.medicamento || [];
        await Promise.all(medicamentos.map(async (medicamento: Medicamento) => {
            if (medicamento.cod_medicamento) {
                await deleteRecordatorio(medicamento.cod_medicamento);
                await axios.delete(
                    `${API_URL}/deleteMedication?id=${medicamento.cod_medicamento}`,
                    axiosConfig
                );
            }
        }));
        await axios.delete(`${API_URL}/deleterecipe?id=${id}`, axiosConfig);

    } catch (error) {
        console.error("Error al eliminar la receta y sus dependencias", error);
        throw new Error("Error al eliminar la receta y sus dependencias");
    }
};