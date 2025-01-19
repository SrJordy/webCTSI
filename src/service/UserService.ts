import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllUsers = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/userall`);
        console.log("DATOS DE LOS getAllUsersWithRelations",response.data)
        return response.data;
    } catch (error) {
        console.error("Error al obtener los usuarios", error);
        throw new Error("Error al obtener los usuarios");
    }
};

export const getUser = async (criteria: any): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/user`, { params: criteria });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el usuario", error);
        throw new Error("Error al obtener el usuario");
    }
};

export const createUser = async (data: any): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/createuser`, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear el usuario", error);
        throw new Error("Error al crear el usuario");
    }
};


export const updateUser = async (id: number, data: any): Promise<any> => {
    try {
        const response = await axios.put(`${API_URL}/updateuser?id=${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar el usuario", error);
        throw new Error("Error al actualizar el usuario");
    }
};

export const deleteUser = async (id: number): Promise<any> => {
    try {
        const response = await axios.delete(`${API_URL}/deleteuser?id=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar el usuario", error);
        throw new Error("Error al eliminar el usuario");
    }
};
