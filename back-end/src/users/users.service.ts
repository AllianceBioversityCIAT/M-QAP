import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {Repository} from 'typeorm';
import {PaginatorService} from 'src/paginator/paginator.service';
import {PaginatedQuery, PaginatorQuery} from 'src/paginator/types';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
    constructor(
        @InjectRepository(User)
        public userRepository: Repository<User>,
        private readonly paginatorService: PaginatorService,
    ) {
        super(userRepository);
    }

    public findAll(query: PaginatorQuery): Promise<PaginatedQuery<User>> {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id AS id',
                'user.creation_date AS creation_date',
                'user.update_date AS update_date',
                'user.email AS email',
                'user.role AS role',
                'user.first_name AS first_name',
                'user.last_name AS last_name',
                'user.full_name AS full_name',
            ]);

        return this.paginatorService.paginator(query, queryBuilder, [
            'user.id',
            'user.creation_date',
            'user.update_date',
            'user.email',
            'user.role',
            'user.first_name',
            'user.last_name',
            'user.full_name',
        ], 'user.id');
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({where: {email}})
    }
}
