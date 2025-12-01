export interface Respuesta {
    id: number;
    response: string;
    category: string;
    date: string;
    source?: 'manual' | 'file';
    fileName?: string;
    personId?: string;
    sede: string;
    ciudad: string;
    genero: 'Masculino' | 'Femenino' | 'Otro' | 'No especifica';
}

export interface Pregunta {
    id: number;
    text: string;
    category: string;
    responses: Respuesta[];
    status?: 'approved' | 'pending' | 'rejected';
}

export interface Usuario {
    username: string;
    email: string;
    role: string;
}
