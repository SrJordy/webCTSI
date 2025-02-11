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

export interface RecetaData {
    persona_id: number;
    profesional_id: number;
    cod_receta?: number;
    dispositivo_id?: string;
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

export const getDispositivoId = async (recetaId: number): Promise<string | null> => {
    try {
        const response = await axios.get(`${API_URL}/recipedetails?id=${recetaId}`, axiosConfig);
        const dispositivoId = response.data.persona.cuidador.dispositivo_id;
        console.log('Dispositivo ID obtenido:', dispositivoId);
        return dispositivoId || null; 
    } catch (error) {
        console.error("Error al obtener el dispositivo ID", error);
        throw new Error("Error al obtener el dispositivo ID");
    }
};

export const getRecetaConMedicamentos = async (id: number): Promise<RecetaData> => {
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

                    if (cod_receta !== undefined) {
                        const dispositivoId = await getDispositivoId(cod_receta);
                        if (dispositivoId) {
                            await createRecordatorio(recordatorioData, dispositivoId); 
                        } else {
                            console.error("dispositivoId is null");
                        }
                    } else {
                        console.error("recetaData.cod_receta is undefined");
                    }
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
    medicamentos: Array<Medicamento>
) => {
    try {
        const medicamentosActualizados = await Promise.all(medicamentos.map(async (medicamento) => {
            const medicamentoData = {
                nombre: medicamento.nombre,
                descripcion: medicamento.descripcion,
                frecuenciamin: Number(medicamento.frecuenciamin),
                cantidadtotal: Number(medicamento.cantidadtotal),
                receta_id: id
            };

            console.log('Datos del medicamento a actualizar:', medicamentoData);

            let medicamentoActualizado;
            if (medicamento.cod_medicamento) {
                medicamentoActualizado = await axios.put(
                    `${API_URL}/updateMedication?id=${medicamento.cod_medicamento}`,
                    medicamentoData,
                    axiosConfig
                );
            } else {
                medicamentoActualizado = await axios.post(
                    `${API_URL}/createMedication`,
                    medicamentoData,
                    axiosConfig
                );
            }

            if (medicamento.recordatorioModificado) {
                const med_id = medicamento.cod_medicamento || medicamentoActualizado.data.cod_medicamento;
                
                if (medicamento.cod_medicamento) {
                    console.log('Eliminando recordatorios existentes para medicamento:', med_id);
                    await deleteRecordatorio(med_id);
                }

                if (medicamento.recordatorio.fechahora) {
                    const cantidadTotal = Number(medicamento.cantidadtotal);
                    const frecuencia = Number(medicamento.frecuenciamin);

                    console.log('Creando nuevos recordatorios:', {
                        cantidadTotal,
                        frecuencia,
                        fechaInicial: medicamento.recordatorio.fechahora
                    });

                    for (let i = 0; i < cantidadTotal; i++) {
                        const fechaBase = new Date(medicamento.recordatorio.fechahora);
                        fechaBase.setMinutes(fechaBase.getMinutes() + i * frecuencia);

                        const recordatorioData = {
                            medicamento_id: med_id,
                            fechahora: fechaBase,
                            persona_id: recetaData.persona_id,
                            estado: true
                        };

                        if (id !== undefined) {
                            const dispositivoId = await getDispositivoId(id);
                            if (dispositivoId) {
                                await createRecordatorio(recordatorioData, dispositivoId); 
                            } else {
                                console.error("dispositivoId is null");
                            }
                        } else {
                            console.error("recetaData.cod_receta is undefined");
                        }
                    }
                }
            }

            return medicamentoActualizado.data;
        }));

        return {
            receta: recetaData,
            medicamentos: medicamentosActualizados
        };
    } catch (error) {
        console.error('Error detallado en updateReceta:', error);
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

export const deleteMedicamento = async (id: number): Promise<void> => {
    try {
        console.log('Eliminando medicamento:', id);
        await axios.delete(`${API_URL}/deleteMedication?id=${id}`, axiosConfig);
        console.log('Medicamento eliminado exitosamente');
    } catch (error) {
        console.error("Error al eliminar el medicamento:", error);
        throw new Error("Error al eliminar el medicamento");
    }
};