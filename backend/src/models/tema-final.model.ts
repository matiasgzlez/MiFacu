import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Materia } from './materias.model';
import { User } from './user.model';

@Entity('temas_finales')
export class TemaFinal {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'materia_id', type: 'int' })
    materiaId!: number;

    @ManyToOne(() => Materia)
    @JoinColumn({ name: "materia_id" })
    materia!: Materia;

    @Column({ name: 'tema', type: 'varchar', length: 300 })
    tema!: string;

    @Column({ name: 'fecha_mesa', type: 'date', nullable: true })
    fechaMesa!: Date | null;

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
