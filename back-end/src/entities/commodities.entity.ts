import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class Commodity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @CreateDateColumn()
    creation_date: string;

    @ApiProperty()
    @UpdateDateColumn()
    update_date: string;

    @ApiProperty()
    @Column({unique: true})
    name: string;

    @ApiProperty()
    @Column()
    source: string;

    @ApiProperty()
    @Column({nullable: true})
    parent_id?: number;

    @ApiProperty({type: () => Commodity})
    @ManyToOne(() => Commodity, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'parent_id'})
    parent: Commodity;
}
