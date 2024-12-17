import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const USERS_URL = `${API_URL}/ApiUser`;

export const getAllUsers = async (): Promise<any> => {
    try {
        const response = await axios.get(USERS_URL);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
        throw new Error("Error al obtener los usuarios");
    }
};

export const getUser = async (criteria: any): Promise<any> => {
    try {
        const response = await axios.get(USERS_URL, { params: criteria });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el usuario", error);
        throw new Error("Error al obtener el usuario");
    }
};

export const createUser = async (data: any): Promise<any> => {
    try {
        const response = await axios.post(USERS_URL, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el usuario", error);
        throw new Error("Error al crear el usuario");
    }
};


export const updateUser = async (id: number, data: any): Promise<any> => {
    try {
        const response = await axios.put(`${USERS_URL}?id=${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el usuario", error);
        throw new Error("Error al actualizar el usuario");
    }
};

export const deleteUser = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(`${USERS_URL}?id=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar el usuario", error);
        throw new Error("Error al eliminar el usuario");
    }
};
