export interface Diagnostico {
    cod_diagnostico: number;
    descripcion: string;
    fecha_diagnostico: string;
    historial_id: number;
    historial?: {
        persona: {
            nombre: string;
            apellido: string;
        };
        profesional: {
            nombre: string;
            apellido: string;
        };
    };
}

export interface DiagnosticoCreate {
    descripcion: string;
    fecha_diagnostico: string;
    historial_id: number;
}

export interface DiagnosticoUpdate {
    descripcion?: string;
    fecha_diagnostico?: string;
    historial_id?: number;
}