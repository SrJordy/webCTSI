import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const LOGIN_URL = `${API_URL}/login`;

export const loginWithCredentials = async (email: string, password: string) => {
    try {
        const response = await axios.post(LOGIN_URL, { email, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
};
