import axios from "axios";
import { Cita } from "../assets/Cita";
import { getUser } from "./UserService";

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

export const createCita = async (
    data: Omit<Cita, "cod_cita" | "status">
): Promise<Cita> => {
    try {
        const response = await axios.post(`${API_URL}/createCite`, data);
        const cita: Cita = response.data;
        const rawFecha = (cita as any).fechahora;
        if (!rawFecha) {
            throw new Error(`Invalid fecha value provided: ${rawFecha}`);
        }
        const fechaCita = new Date(rawFecha);
        if (isNaN(fechaCita.getTime())) {
            throw new Error(`Invalid fecha value provided: ${rawFecha}`);
        }
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Guayaquil",
        };
        const formattedDate = fechaCita.toLocaleString("es-EC", options);
        const dispositivoData = await getDispositivoId(cita.persona_id);
        
        const profesionalData = await getUser({ id: cita.profesional_id });
        
        console.log(dispositivoData);
        if (!dispositivoData) {
            throw new Error("No se pudo obtener los datos del dispositivo");
        }
        const playerId = dispositivoData.persona?.cuidador?.dispositivo_id || "";
        const nombrePaciente = `${dispositivoData.persona?.nombre || ""} ${dispositivoData.persona?.apellido || ""}`;
        
        const nombreProfesional = profesionalData ? 
            `${profesionalData.nombre || ""} ${profesionalData.apellido || ""}` : 
            "profesional asignado";
            
        const notificacionData: NotificacionData = {
            type: "scheduled",
            title: "Cita programada",
            message: `El paciente ${nombrePaciente} tiene una cita programada para el ${formattedDate} con el profesional ${nombreProfesional}.`,
            playerId: playerId,
            scheduledTime: fechaCita.toISOString(),
        };
        console.log(notificacionData);
        await createNotificacion(notificacionData);
        return cita;
    } catch (error) {
        console.error("Error al crear la cita", error);
        throw new Error("Error al crear la cita");
    }
};

export const updateCita = async (
    id: number,
    data: Partial<Omit<Cita, "cod_cita">>
): Promise<Cita> => {
    try {
        const response = await axios.put(`${API_URL}/updateCite`, data, {
            params: { id },
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la cita", error);
        throw new Error("Error al actualizar la cita");
    }
};

export const deleteCita = async (
    id: number
): Promise<{ message: string }> => {
    try {
        const response = await axios.delete(`${API_URL}/deleteCite`, {
            params: { id },
        });
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la cita", error);
        throw new Error("Error al eliminar la cita");
    }
};

export const getDispositivoId = async (
    personaId: number
): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/getpersonacita`, {
            params: { id: personaId },
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener el dispositivo ID", error);
        throw new Error("Error al obtener el dispositivo ID");
    }
};

interface NotificacionData {
    type: string;
    title: string;
    message: string;
    playerId: string;
    scheduledTime: string;
}

export const createNotificacion = async (
    notificacionData: NotificacionData
): Promise<void> => {
    try {
        console.log("Creando notificación:", notificacionData);
        const response = await axios.post(
            `${API_URL}/notifications`,
            notificacionData
        );
        console.log("Notificación creada exitosamente:", response.data);
    } catch (error) {
        console.error("Error al crear la notificación:", error);
        throw new Error("Error al crear la notificación");
    }
};