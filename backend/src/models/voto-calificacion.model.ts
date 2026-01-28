import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { TipoVoto } from '../types/calificaciones';
import { CalificacionCatedra } from './calificacion-catedra.model';
import { User } from './user.model';

@Entity('votos_calificaciones')
@Unique(['calificacionId', 'userId'])
export class VotoCalificacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'calificacion_id', type: 'int' })
    calificacionId!: number;

    @ManyToOne(() => CalificacionCatedra, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "calificacion_id" })
    calificacion!: CalificacionCatedra;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: 'tipo', type: 'enum', enum: TipoVoto })
    tipo!: TipoVoto;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
