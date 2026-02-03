import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.model";

@Entity('user_gamification')
export class UserGamification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id', type: 'uuid', unique: true })
    userId!: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'xp_total', type: 'int', default: 0 })
    xpTotal!: number;

    @Column({ type: 'int', default: 1 })
    nivel!: number;

    @Column({ name: 'racha_actual', type: 'int', default: 0 })
    rachaActual!: number;

    @Column({ name: 'racha_maxima', type: 'int', default: 0 })
    rachaMaxima!: number;

    @Column({ name: 'ultimo_dia_activo', type: 'date', nullable: true })
    ultimoDiaActivo?: string | null;

    @Column({ name: 'sesiones_totales', type: 'int', default: 0 })
    sesionesTotales!: number;

    @Column({ name: 'minutos_totales', type: 'int', default: 0 })
    minutosTotales!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
