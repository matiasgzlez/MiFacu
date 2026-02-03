import { TipoVoto } from './calificaciones';

export { TipoVoto };

export interface TemaFinal {
    id: number;
    materiaId: number;
    materia: {
        id: number;
        nombre: string;
        numero?: number;
    };
    tema: string;
    fechaMesa: string | null;
    esAnonimo: boolean;
    userId: string;
    user: {
        id: string;
        email?: string;
        nombre?: string;
        avatarUrl?: string;
    } | null;
    esVerificado: boolean;
    votosUtiles: number;
    votosNoUtiles: number;
    reportes: number;
    miVoto: TipoVoto | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemaFinalDTO {
    materiaId: number;
    tema: string;
    fechaMesa?: string;
    esAnonimo?: boolean;
}

export interface UpdateTemaFinalDTO {
    tema?: string;
    fechaMesa?: string;
}

export interface EstadisticaTema {
    tema: string;
    veces: number;
    votosUtiles: number;
}

export const MOTIVOS_REPORTE_TEMAS = [
    'Contenido inapropiado u ofensivo',
    'Informacion falsa o enganosa',
    'Spam o publicidad',
    'Acoso o discriminacion',
    'Otro motivo',
];
