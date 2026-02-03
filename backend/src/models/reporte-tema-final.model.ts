import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from "typeorm";
import { TemaFinal } from './tema-final.model';
import { User } from './user.model';

@Entity('reportes_temas_finales')
@Unique(['temaFinalId', 'userId'])
export class ReporteTemaFinal {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'tema_final_id', type: 'int' })
    temaFinalId!: number;

    @ManyToOne(() => TemaFinal, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "tema_final_id" })
    temaFinal!: TemaFinal;

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
