import { Repository } from 'typeorm';
import { AppDataSource } from '../config/DataSource';
import { TemaFinal } from '../models/tema-final.model';
import { VotoTemaFinal } from '../models/voto-tema-final.model';
import { ReporteTemaFinal } from '../models/reporte-tema-final.model';
import { AppError } from '../middleware/errorHandler.middleware';
import { CreateTemaFinalDTO, UpdateTemaFinalDTO, TipoVoto } from '../types/temas-finales';
import { contieneProhibidas } from '../utils/filtro-palabras';

export class TemaFinalService {
    private temaFinalRepository: Repository<TemaFinal>;
    private votoRepository: Repository<VotoTemaFinal>;
    private reporteRepository: Repository<ReporteTemaFinal>;

    constructor() {
        this.temaFinalRepository = AppDataSource.getRepository(TemaFinal);
        this.votoRepository = AppDataSource.getRepository(VotoTemaFinal);
        this.reporteRepository = AppDataSource.getRepository(ReporteTemaFinal);
    }

    async getAll(materiaId?: number): Promise<TemaFinal[]> {
        const whereClause = materiaId ? { materiaId } : {};

        return await this.temaFinalRepository.find({
            where: whereClause,
            relations: ['materia', 'user'],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async getById(id: number): Promise<TemaFinal> {
        const temaFinal = await this.temaFinalRepository.findOne({
            where: { id },
            relations: ['materia', 'user'],
        });

        if (!temaFinal) {
            throw new AppError('Tema de final no encontrado', 404);
        }

        return temaFinal;
    }

    async create(data: CreateTemaFinalDTO, userId: string): Promise<TemaFinal> {
        if (contieneProhibidas(data.tema)) {
            throw new AppError('El tema contiene palabras inapropiadas', 400);
        }

        const temaFinal = this.temaFinalRepository.create({
            materiaId: data.materiaId,
            tema: data.tema.trim(),
            fechaMesa: data.fechaMesa ? new Date(data.fechaMesa) : null,
            esAnonimo: data.esAnonimo ?? false,
            userId,
            votosUtiles: 0,
            votosNoUtiles: 0,
            reportes: 0,
        });

        return await this.temaFinalRepository.save(temaFinal);
    }

    async update(id: number, data: UpdateTemaFinalDTO, userId: string): Promise<TemaFinal> {
        const temaFinal = await this.getById(id);

        if (temaFinal.userId !== userId) {
            throw new AppError('No tienes permiso para editar este tema', 403);
        }

        if (data.tema && contieneProhibidas(data.tema)) {
            throw new AppError('El tema contiene palabras inapropiadas', 400);
        }

        Object.assign(temaFinal, {
            tema: data.tema?.trim() ?? temaFinal.tema,
            fechaMesa: data.fechaMesa ? new Date(data.fechaMesa) : temaFinal.fechaMesa,
        });

        return await this.temaFinalRepository.save(temaFinal);
    }

    async delete(id: number, userId: string): Promise<void> {
        const temaFinal = await this.getById(id);

        if (temaFinal.userId !== userId) {
            throw new AppError('No tienes permiso para eliminar este tema', 403);
        }

        await this.temaFinalRepository.remove(temaFinal);
    }

    async votar(id: number, tipo: TipoVoto, userId: string): Promise<TemaFinal> {
        const temaFinal = await this.getById(id);

        if (temaFinal.userId === userId) {
            throw new AppError('No puedes votar tu propio tema', 400);
        }

        const votoExistente = await this.votoRepository.findOne({
            where: { temaFinalId: id, userId },
        });

        if (votoExistente) {
            if (votoExistente.tipo === tipo) {
                await this.votoRepository.remove(votoExistente);

                if (tipo === TipoVoto.Util) {
                    temaFinal.votosUtiles = Math.max(0, temaFinal.votosUtiles - 1);
                } else {
                    temaFinal.votosNoUtiles = Math.max(0, temaFinal.votosNoUtiles - 1);
                }
            } else {
                const tipoAnterior = votoExistente.tipo;
                votoExistente.tipo = tipo;
                await this.votoRepository.save(votoExistente);

                if (tipoAnterior === TipoVoto.Util) {
                    temaFinal.votosUtiles = Math.max(0, temaFinal.votosUtiles - 1);
                    temaFinal.votosNoUtiles += 1;
                } else {
                    temaFinal.votosNoUtiles = Math.max(0, temaFinal.votosNoUtiles - 1);
                    temaFinal.votosUtiles += 1;
                }
            }
        } else {
            const nuevoVoto = this.votoRepository.create({
                temaFinalId: id,
                userId,
                tipo,
            });
            await this.votoRepository.save(nuevoVoto);

            if (tipo === TipoVoto.Util) {
                temaFinal.votosUtiles += 1;
            } else {
                temaFinal.votosNoUtiles += 1;
            }
        }

        return await this.temaFinalRepository.save(temaFinal);
    }

    async reportar(id: number, motivo: string, userId: string): Promise<TemaFinal> {
        const temaFinal = await this.getById(id);

        const reporteExistente = await this.reporteRepository.findOne({
            where: { temaFinalId: id, userId },
        });

        if (reporteExistente) {
            throw new AppError('Ya has reportado este tema', 400);
        }

        const nuevoReporte = this.reporteRepository.create({
            temaFinalId: id,
            userId,
            motivo: motivo.trim(),
        });
        await this.reporteRepository.save(nuevoReporte);

        temaFinal.reportes += 1;

        return await this.temaFinalRepository.save(temaFinal);
    }

    async getEstadisticasMateria(materiaId: number): Promise<{ tema: string; veces: number; votosUtiles: number }[]> {
        const result = await this.temaFinalRepository
            .createQueryBuilder('t')
            .select('t.tema', 'tema')
            .addSelect('COUNT(t.id)', 'veces')
            .addSelect('SUM(t.votos_utiles)', 'votosUtiles')
            .where('t.materia_id = :materiaId', { materiaId })
            .groupBy('t.tema')
            .orderBy('veces', 'DESC')
            .addOrderBy('"votosUtiles"', 'DESC')
            .getRawMany();

        return result.map(r => ({
            tema: r.tema,
            veces: parseInt(r.veces || '0'),
            votosUtiles: parseInt(r.votosUtiles || '0'),
        }));
    }

    async getVotoUsuario(temaFinalId: number, userId: string): Promise<TipoVoto | null> {
        const voto = await this.votoRepository.findOne({
            where: { temaFinalId, userId },
        });

        return voto?.tipo ?? null;
    }

    async getVotosUsuario(temaFinalIds: number[], userId: string): Promise<Record<number, TipoVoto>> {
        const votos = await this.votoRepository.find({
            where: temaFinalIds.map(id => ({ temaFinalId: id, userId })),
        });

        return votos.reduce((acc, voto) => {
            acc[voto.temaFinalId] = voto.tipo;
            return acc;
        }, {} as Record<number, TipoVoto>);
    }
}
