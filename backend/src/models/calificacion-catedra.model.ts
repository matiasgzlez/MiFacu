import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Dificultad } from '../types/calificaciones';
import { Materia } from './materias.model';
import { User } from './user.model';

@Entity('calificaciones_catedras')
export class CalificacionCatedra {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'materia_id', type: 'int' })
    materiaId!: number;

    @ManyToOne(() => Materia)
    @JoinColumn({ name: "materia_id" })
    materia!: Materia;

    @Column({ name: 'profesor_nombre', type: 'varchar', length: 150 })
    profesorNombre!: string;

    @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1 })
    rating!: number;

    @Column({ name: 'dificultad', type: 'enum', enum: Dificultad })
    dificultad!: Dificultad;

    @Column({ name: 'comentario', type: 'text' })
    comentario!: string;

    @Column({ name: 'es_anonimo', type: 'boolean', default: false })
    esAnonimo!: boolean;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: 'votos_utiles', type: 'int', default: 0 })
    votosUtiles!: number;

    @Column({ name: 'votos_no_utiles', type: 'int', default: 0 })
    votosNoUtiles!: number;

    @Column({ name: 'reportes', type: 'int', default: 0 })
    reportes!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
