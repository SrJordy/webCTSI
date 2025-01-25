import axios from "axios";
import {Cita} from "../assets/Cita";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllCitas = async (): Promise<Cita[]> => {
    try {
        const response = await axios.get(`${API_URL}/getAllCites`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las citas", error);
        throw new Error("Error al obtener las citas");
    }
};

export const getCita = async (id: number): Promise<Cita> => {
    try {
        const response = await axios.get(`${API_URL}/getCite`, { params: { id } });
        return response.data;
    } catch (error) {
        console.error("Error al obtener la cita", error);
        throw new Error("Error al obtener la cita");
    }
};

export const createCita = async (data: Omit<Cita, 'cod_cita' | 'status'>): Promise<Cita> => {
    try {
        const response = await axios.post(`${API_URL}/createCite`, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear la cita", error);
        throw new Error("Error al crear la cita");
    }
};

export const updateCita = async (id: number, data: Partial<Omit<Cita, 'cod_cita'>>): Promise<Cita> => {
    try {
        const response = await axios.put(`${API_URL}/updateCite`, data, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la cita", error);
        throw new Error("Error al actualizar la cita");
    }
};

export const deleteCita = async (id: number): Promise<{ message: string }> => {
    try {
        const response = await axios.delete(`${API_URL}/deleteCite`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la cita", error);
        throw new Error("Error al eliminar la cita");
    }
};