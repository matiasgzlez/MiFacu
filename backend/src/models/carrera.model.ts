import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Universidad } from "./universidad.model";
import { Materia } from "./materias.model";
import { User } from "./user.model";

@Entity('carreras')
export class Carrera {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'universidad_id' })
    universidadId!: string;

    @ManyToOne(() => Universidad, (universidad) => universidad.carreras)
    @JoinColumn({ name: 'universidad_id' })
    universidad!: Universidad;

    @Column({ type: 'varchar', length: 150 })
    nombre!: string;

    @OneToMany(() => Materia, (materia) => materia.carrera)
    materias!: Materia[];

    @OneToMany(() => User, (user) => user.carrera)
    users!: User[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
