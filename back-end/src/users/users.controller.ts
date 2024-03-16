import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Query,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiTags,
} from '@nestjs/swagger';
import {User} from '../entities/user.entity';
import {UsersService} from './users.service';
import {createReadStream} from 'fs';
import {join} from 'path';
import {unlink} from 'fs/promises';
import {In, Not} from 'typeorm';
import {CreateAndUpdateUsers, ExportToExcel} from 'src/users/dto/users.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {Role} from '../auth/role.enum';
import {Paginator} from 'src/paginator/paginator.decorator';
import {PaginatorQuery} from 'src/paginator/types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin])
@ApiBearerAuth()
@ApiCreatedResponse({
    description: '',
    type: [User],
})
@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
    }

    sort(query) {
        if (query?.sort) {
            let obj = {};
            const sorts = query.sort.split(',');
            obj[sorts[0]] = sorts[1];
            return obj;
        } else return {id: 'ASC'};
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne({where: {id}});
    }

    @Patch(':id')
    @ApiBody({type: CreateAndUpdateUsers})
    @ApiCreatedResponse({
        description: '',
        type: CreateAndUpdateUsers,
    })
    async updateUser(@Body() data: any, @Param('id') id: number) {
        const user = await this.usersService.userRepository.findOne({
            where: {id},
        });
        if (user) {
            const emailExist = await this.usersService.userRepository.findOne({
                where: {
                    email: data.email,
                    id: Not(user.id)
                },
            });
            if (emailExist == null || emailExist.id === user.id) {
                if (data?.email) {
                    data['email'] = data?.email.toLowerCase();
                }
                return this.usersService.userRepository.update({id}, {...data});
            } else {
                throw new BadRequestException('The email is already used.');
            }
        } else {
            throw new BadRequestException('User not found.');
        }
    }

    @Post()
    @ApiBody({type: CreateAndUpdateUsers})
    @ApiCreatedResponse({
        description: '',
        type: CreateAndUpdateUsers,
    })
    async addUser(@Body() data: any) {
        const emailExist = await this.usersService.userRepository.findOne({
            where: {email: data.email},
        });
        if (emailExist == null) {
            const user = this.usersService.userRepository.create();
            if (data?.email) data['email'] = data?.email.toLowerCase();
            Object.assign(user, data);
            await this.usersService.userRepository.save(user, {reload: true});
            return user;
        } else {
            throw new BadRequestException('User already exist');
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        try {
            return await this.usersService.userRepository.delete(id);
        } catch (error) {
            if (error.errno === 1451) {
                throw new BadRequestException('Cannot delete, this user is in use.');
            } else {
                throw new InternalServerErrorException('Oops! something went wrong.');
            }
        }
    }

    @Get('export/all')
    @ApiCreatedResponse({
        description: '',
        type: ExportToExcel,
    })
    async export(@Query() query: any) {
        let users = await this.usersService.userRepository
            .createQueryBuilder('users')
            .where('users.full_name like :full_name', {
                full_name: `%${query.email}%`,
            })
            .orWhere('users.email like :email', {email: `%${query.email}%`})
            .select('users.id as id')
            .getRawMany();

        const result =
            await this.usersService.userRepository.find({
                where: {
                    id: users.length ? In(users.map(d => d.id)) : null,
                    role: query?.role ? query?.role : null,
                },
                order: {...this.sort(query)},
            });

        const file_name = 'All-Users.xlsx';
        var wb = XLSX.utils.book_new();

        const ws = XLSX.utils.json_to_sheet(result);

        XLSX.utils.book_append_sheet(wb, ws, 'Users');
        await XLSX.writeFile(wb, join(process.cwd(), 'generated_files', file_name));
        const file = createReadStream(
            join(process.cwd(), 'generated_files', file_name),
        );

        setTimeout(async () => {
            try {
                await unlink(join(process.cwd(), 'generated_files', file_name));
            } catch (e) {
            }
        }, 9000);
        return new StreamableFile(file, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: `attachment; filename="${file_name}"`,
        });
    }
}
