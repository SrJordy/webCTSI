import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL; 


interface Tratamiento {
    cod_tratamiento?: number;
    descripcion: string;
    fechainicio: Date | string;
    fechafin: Date | string;
    historial_id: number;
    
}

class TratamientoServiceError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'TratamientoServiceError';
    }
}

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
};

const validateTratamiento = (tratamientoData: Tratamiento) => {
    const { descripcion, fechainicio, fechafin, historial_id } = tratamientoData;

    if (!descripcion) {
        throw new TratamientoServiceError("La descripción es requerida.", "VALIDATION_ERROR");
    }
    if (!fechainicio || isNaN(new Date(fechainicio).getTime())) {
        throw new TratamientoServiceError("La fecha de inicio es requerida y debe ser válida.", "VALIDATION_ERROR");
    }
    if (!fechafin || isNaN(new Date(fechafin).getTime())) {
        throw new TratamientoServiceError("La fecha de fin es requerida y debe ser válida.", "VALIDATION_ERROR");
    }
    if (!historial_id) {
        throw new TratamientoServiceError("El ID del historial es requerido.", "VALIDATION_ERROR");
    }
    if (new Date(fechafin) <= new Date(fechainicio)) {
        throw new TratamientoServiceError("La fecha de fin debe ser posterior a la fecha de inicio.", "VALIDATION_ERROR");
    }
};

export const TratamientoService = {
    async getAllTratamientos(): Promise<Tratamiento[]> {
        try {
            const response = await axios.get(`${API_URL}/getAllTreatments`);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error al obtener los tratamientos", error);
            toast.error('Error al obtener los tratamientos');
            throw new TratamientoServiceError('Error al obtener los tratamientos', 'FETCH_ERROR');
        }
    },

    async getTratamiento(id: number): Promise<Tratamiento> {
        try {
            const response = await axios.get(`${API_URL}/getTreatment?id=${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener el tratamiento", error);
            toast.error('Error al obtener el tratamiento');
            throw new TratamientoServiceError('Error al obtener el tratamiento', 'FETCH_ERROR');
        }
    },

    async createTratamiento(tratamientoData: Tratamiento): Promise<Tratamiento> {
        validateTratamiento(tratamientoData); 

        try {
            console.log("tratamientoData", tratamientoData);
            const response = await axios.post(`${API_URL}/createTreatment`, tratamientoData);
            toast.success('Tratamiento creado exitosamente');
            return response.data;
        } catch (error) {
            console.error("Error al crear el tratamiento", error);
            toast.error('Error al crear el tratamiento');
            throw new TratamientoServiceError('Error al crear el tratamiento', 'CREATE_ERROR');
        }
    },

    async updateTratamiento(id: number, tratamientoData: Partial<Tratamiento>): Promise<Tratamiento> {
        if (tratamientoData.fechainicio || tratamientoData.fechafin) {
            validateTratamiento({ ...tratamientoData, historial_id: tratamientoData.historial_id || 0 } as Tratamiento);
        }

        try {
            const response = await axios.put(`${API_URL}/updateTreatment?id=${id}`, tratamientoData);
            toast.success('Tratamiento actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error("Error al actualizar el tratamiento", error);
            toast.error('Error al actualizar el tratamiento');
            throw new TratamientoServiceError('Error al actualizar el tratamiento', 'UPDATE_ERROR');
        }
    },

    async deleteTratamiento(id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/deleteTreatment?id=${id}`, axiosConfig);
            toast.success('Tratamiento eliminado exitosamente');
        } catch (error) {
            console.error("Error al eliminar el tratamiento", error);
            toast.error('Error al eliminar el tratamiento');
            throw new TratamientoServiceError('Error al eliminar el tratamiento', 'DELETE_ERROR');
        }
    }
};

export default TratamientoService;