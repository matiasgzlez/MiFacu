export enum Dificultad {
    Facil = 'facil',
    Media = 'media',
    Dificil = 'dificil',
}

export enum TipoVoto {
    Util = 'util',
    NoUtil = 'no_util',
}

export interface ICalificacionCatedra {
    id: number;
    materiaId: number;
    profesorNombre: string;
    rating: number;
    dificultad: Dificultad;
    comentario: string;
    esAnonimo: boolean;
    userId: string;
    votosUtiles: number;
    votosNoUtiles: number;
    reportes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IVotoCalificacion {
    id: number;
    calificacionId: number;
    userId: string;
    tipo: TipoVoto;
    createdAt: Date;
}

export interface IReporteCalificacion {
    id: number;
    calificacionId: number;
    userId: string;
    motivo: string;
    createdAt: Date;
}

export interface CreateCalificacionDTO {
    materiaId: number;
    profesorNombre: string;
    rating: number;
    dificultad: Dificultad;
    comentario: string;
    esAnonimo?: boolean;
}

export interface UpdateCalificacionDTO {
    profesorNombre?: string;
    rating?: number;
    dificultad?: Dificultad;
    comentario?: string;
    esAnonimo?: boolean;
}

export interface VotarDTO {
    tipo: TipoVoto;
}

export interface ReportarDTO {
    motivo: string;
}
