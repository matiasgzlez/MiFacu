import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Recordatorio } from "./recordatorios.model";
import { Final } from "./finales.model";
import { Carrera } from "./carrera.model";

@Entity('users')
export class User {
    @PrimaryColumn('uuid')
    id!: string; // Supabase User ID

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    nombre!: string;

    @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
    avatarUrl?: string;

    @Column({ name: 'carrera_id', type: 'uuid', nullable: true })
    carreraId?: string;

    @ManyToOne(() => Carrera, (carrera) => carrera.users)
    @JoinColumn({ name: 'carrera_id' })
    carrera!: Carrera;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @OneToMany(() => Recordatorio, recordatorio => recordatorio.user)
    recordatorios!: Recordatorio[];

    @OneToMany(() => Final, final => final.user)
    finales!: Final[];
}
