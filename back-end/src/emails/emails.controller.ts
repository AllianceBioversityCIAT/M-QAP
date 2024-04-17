import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles.decorator";
import {Role} from "../auth/role.enum";
import {ApiTags} from "@nestjs/swagger";
import {Paginator} from "../paginator/paginator.decorator";
import {PaginatorQuery} from "../paginator/types";
import {EmailsService} from "./emails.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([Role.Admin])
@ApiTags('Email')
@Controller('emails')
export class EmailsController {
    constructor(private emailsService: EmailsService) {
    }

    @Get('')
    findAll(@Paginator() query: PaginatorQuery) {
        return this.emailsService.findAll(query);
    }

    @Get('send-email/:id')
    sendEmail(@Param('id') id: number) {
        return this.emailsService.sendEmail(id);
    }
}
