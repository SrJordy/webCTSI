import axios from "axios";

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
        const response = await axios.get(RECETA_URL);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las recetas", error);
        throw new Error("Error al obtener las recetas");
    }
};

export const getReceta = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${RECETA_URL}?id=${id}`);
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
    recetaData: {
        persona_id: number;
        profesional_id: number;
    },
    medicamentos: Array<{
        nombre: string;
        descripcion: string;
        frecuenciamin: number;
        cantidadtotal: number;
    }>,
    recordatorios: Array<{
        fechahora: Date;
        persona_id: number;
    }>
): Promise<any> => {
    try {
        // 1. Crear la receta
        console.log('Datos de la receta a crear:', recetaData);
        const recetaResponse = await axios.post(RECETA_URL, recetaData);
        const cod_receta = recetaResponse.data.cod_receta;
        console.log('Receta creada exitosamente con ID:', cod_receta);

        // 2. Crear los medicamentos asociados a la receta
        const medicamentosCreados = [];
        for (const medicamento of medicamentos) {
            const medicamentoData = {
                ...medicamento,
                receta_id: cod_receta
            };
            console.log('Creando medicamento:', medicamentoData);
            const medicamentoResponse = await axios.post(MEDICAMENTO_URL, medicamentoData);
            const cod_medicamento = medicamentoResponse.data.cod_medicamento;
            medicamentosCreados.push({
                cod_medicamento,
                ...medicamento
            });
            console.log('Medicamento creado exitosamente con ID:', cod_medicamento);
        }

        // 3. Crear los recordatorios para cada medicamento
        for (let i = 0; i < medicamentosCreados.length; i++) {
            const recordatoriosParaMedicamento = recordatorios[i];
            if (recordatoriosParaMedicamento) {
                const recordatorioData = {
                    medicamento_id: medicamentosCreados[i].cod_medicamento,
                    fechahora: recordatoriosParaMedicamento.fechahora,
                    persona_id: recetaData.persona_id,
                    estado: true
                };
                console.log('Creando recordatorio:', recordatorioData);
                await axios.post(RECORDATORIO_URL, recordatorioData);
                console.log('Recordatorio creado exitosamente');
            }
        }

        return {
            receta: recetaResponse.data,
            medicamentos: medicamentosCreados
        };
    } catch (error) {
        console.error("Error detallado al crear la receta:", error);
        if (axios.isAxiosError(error)) {
            console.error("Respuesta del servidor:", error.response?.data);
            console.error("Estado de la respuesta:", error.response?.status);
        }
        throw new Error("Error al crear la receta");
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