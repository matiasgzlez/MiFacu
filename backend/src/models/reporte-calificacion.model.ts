import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { CalificacionCatedra } from './calificacion-catedra.model';
import { User } from './user.model';

@Entity('reportes_calificaciones')
@Unique(['calificacionId', 'userId'])
export class ReporteCalificacion {
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

    @Column({ name: 'motivo', type: 'varchar', length: 255 })
    motivo!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
