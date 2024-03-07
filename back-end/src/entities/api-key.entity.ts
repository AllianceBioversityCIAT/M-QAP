import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Organization} from './organization.entity';
import {User} from './user.entity';

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: string;

    @UpdateDateColumn()
    update_date: string;

    @Column({nullable: true, unique: true})
    name: string;

    @OneToOne(() => Organization, (organization) => organization.apikey, {nullable: true})
    @JoinColumn()
    organization: Organization;

    @OneToOne(() => User, (user) => user.apikey, {nullable: true})
    @JoinColumn()
    user: User;

    @Column()
    wos_quota: number;

    @Column({nullable: true, unique: true})
    api_key: string;

    @Column()
    is_active: boolean;
}
