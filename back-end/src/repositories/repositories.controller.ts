import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {RepositoriesService} from './repositories.service';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';
import {CreateRepositoriesDto} from './dto/create-repositories.dto';
import {UpdateRepositoriesDto} from './dto/update-repositories.dto';
import {CreateRepositorySchemaDto} from './dto/create-repositorySchema.dto';
import {ApiTags} from '@nestjs/swagger';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin])
@ApiTags('Repositories')
@Controller('repositories')
export class RepositoriesController {
    constructor(
        private repositoriesService: RepositoriesService
    ) {
    }

    @Post()
    create(@Body() createRepositoriesDto: CreateRepositoriesDto) {
        return this.repositoriesService.create(createRepositoriesDto);
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.repositoriesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.repositoriesService.findOne({where: {id}});
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRepositoriesDto: UpdateRepositoriesDto) {
        return this.repositoriesService.update(+id, updateRepositoriesDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.repositoriesService.remove(+id);
    }

    @Get('schema/:repositoryId')
    findAllSchema(@Param('repositoryId') repositoryId: number) {
        return this.repositoriesService.findAllSchema({where: {repository: {id: repositoryId}}});
    }

    @Patch('schema/:repositoryId')
    updateSchema(
        @Param('repositoryId') repositoryId: number,
        @Body() createRepositorySchemaDto: CreateRepositorySchemaDto[]
    ) {
        return this.repositoriesService.updateSchema(+repositoryId, createRepositorySchemaDto);
    }
}
