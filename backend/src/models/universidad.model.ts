import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Carrera } from "./carrera.model";

@Entity('universidades')
export class Universidad {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    nombre!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    abreviatura?: string;

    @OneToMany(() => Carrera, (carrera) => carrera.universidad)
    carreras!: Carrera[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
