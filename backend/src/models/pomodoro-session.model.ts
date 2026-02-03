import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.model";
import { Materia } from "./materias.model";

export enum TipoSesion {
    FOCUS = 'focus',
    SHORT_BREAK = 'short_break',
    LONG_BREAK = 'long_break',
}

@Entity('pomodoro_sessions')
export class PomodoroSession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 20 })
    tipo!: TipoSesion;

    @Column({ name: 'duracion_minutos', type: 'int' })
    duracionMinutos!: number;

    @Column({ name: 'duracion_real_segundos', type: 'int' })
    duracionRealSegundos!: number;

    @Column({ type: 'boolean', default: false })
    completada!: boolean;

    @Column({ name: 'materia_id', type: 'int', nullable: true })
    materiaId?: number | null;

    @ManyToOne(() => Materia, { nullable: true })
    @JoinColumn({ name: 'materia_id' })
    materia?: Materia;

    @Column({ name: 'xp_ganado', type: 'int', default: 0 })
    xpGanado!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
