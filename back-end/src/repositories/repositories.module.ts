import {Module} from '@nestjs/common';
import {RepositoriesController} from './repositories.controller';
import {RepositoriesService} from './repositories.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Repositories} from 'src/entities/repositories.entity';
import {RepositoriesSchema} from 'src/entities/repositories-schema.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Repositories, RepositoriesSchema])],
    controllers: [RepositoriesController],
    providers: [RepositoriesService],
    exports: [RepositoriesService],
})
export class RepositoriesModule {
}
