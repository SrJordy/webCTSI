import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;   

export const getAllPacientes = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/patientall`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los pacientes", error);
        throw new Error("Error al obtener los pacientes");
    }
};

export const getPaciente = async (criteria: any): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/patient`, { params: criteria });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el paciente", error);
        throw new Error("Error al obtener el paciente");
    }
};

export const createPaciente = async (data: any): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/createPatient`, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el paciente", error);
        throw new Error("Error al crear el paciente");
    }
};

export const updatePaciente = async (id: number, data: any): Promise<any> => {
    try {
        const response = await axios.put(`${API_URL}/updatePatient?id=${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el paciente", error);
        throw new Error("Error al actualizar el paciente");
    }
};

export const deletePaciente = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(`${API_URL}/deletePatient?id=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar el paciente", error);
        throw new Error("Error al eliminar el paciente");
    }
};
