import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {Repository} from 'typeorm';
import {paginate, Paginated, PaginateQuery} from 'nestjs-paginate';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
    constructor(
        @InjectRepository(User)
        public userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    public findAll(query: PaginateQuery): Promise<Paginated<User>> {
        return paginate(query, this.userRepository, {
            sortableColumns: ['id', 'full_name', 'email', 'role'],
            searchableColumns: ['id', 'first_name', 'last_name', 'full_name', 'email', 'role'],
            select: [],
        });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({where: {email}})
    }
}
