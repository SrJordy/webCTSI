import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const PACIENTES_URL = `${API_URL}/ApiPaciente`;

export const getAllPacientes = async (): Promise<any> => {
    try {
        const response = await axios.get(PACIENTES_URL);
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener los pacientes", error);
        throw new Error("Error al obtener los pacientes");
    }
};

export const getPaciente = async (criteria: any): Promise<any> => {
    try {
        const response = await axios.get(PACIENTES_URL, { params: criteria });
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener el paciente", error);
        throw new Error("Error al obtener el paciente");
    }
};

export const createPaciente = async (data: any): Promise<any> => {
    try {
        const response = await axios.post(PACIENTES_URL, data);
        return response.data.data;
    } catch (error) {
        console.error("Error al crear el paciente", error);
        throw new Error("Error al crear el paciente");
    }
};

export const updatePaciente = async (id: number, data: any): Promise<any> => {
    try {
        const response = await axios.put(`${PACIENTES_URL}?id=${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error("Error al actualizar el paciente", error);
        throw new Error("Error al actualizar el paciente");
    }
};

export const deletePaciente = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(`${PACIENTES_URL}?id=${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error al eliminar el paciente", error);
        throw new Error("Error al eliminar el paciente");
    }
};
