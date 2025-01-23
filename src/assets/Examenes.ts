export interface Examen {
    cod_examen: number;
    tipo: string;
    resultados: string;
    fecha: string;
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

export interface ExamenCreate {
    tipo: string;
    resultados: string;
    fecha: string;
    historial_id: number;
}

export interface ExamenUpdate {
    tipo?: string;
    resultados?: string;
    fecha?: string;
    historial_id?: number;
}