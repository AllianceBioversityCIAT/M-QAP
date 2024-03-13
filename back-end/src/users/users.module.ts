import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/user.entity';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';
import {PaginatorService} from '../paginator/paginator.service';

@Module({
    providers: [UsersService, PaginatorService],
    imports: [TypeOrmModule.forFeature([User])],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {
}
