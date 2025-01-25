export interface Cita {
    cod_cita: number;
    fechahora: string;
    lugar: string;
    motivo: string;
    profesional_id: number;
    persona_id: number;
    status: boolean;
    profesion?: {
        nombre: string;
        apellido: string;
        CID: string;
    };
    persona?: {
        nombre: string;
        apellido: string;
        CID: string;
    };
}