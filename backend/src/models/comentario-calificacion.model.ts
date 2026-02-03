import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CalificacionCatedra } from './calificacion-catedra.model';
import { User } from './user.model';

@Entity('comentarios_calificaciones')
export class ComentarioCalificacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'calificacion_id', type: 'int' })
    calificacionId!: number;

    @ManyToOne(() => CalificacionCatedra, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calificacion_id' })
    calificacion!: CalificacionCatedra;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'text' })
    contenido!: string;

    @Column({ name: 'es_anonimo', type: 'boolean', default: false })
    esAnonimo!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
