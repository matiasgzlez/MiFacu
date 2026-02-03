import { TipoVoto } from './calificaciones';

export { TipoVoto };

export interface ITemaFinal {
    id: number;
    materiaId: number;
    tema: string;
    fechaMesa: Date | null;
    esAnonimo: boolean;
    userId: string;
    votosUtiles: number;
    votosNoUtiles: number;
    reportes: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IVotoTemaFinal {
    id: number;
    temaFinalId: number;
    userId: string;
    tipo: TipoVoto;
    createdAt: Date;
}

export interface IReporteTemaFinal {
    id: number;
    temaFinalId: number;
    userId: string;
    motivo: string;
    createdAt: Date;
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
