import {Module} from '@nestjs/common';
import {EmailsController} from './emails.controller';
import {EmailsService} from './emails.service';
import {PaginatorService} from '../paginator/paginator.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Email} from '../entities/email.entity';
import {WosQuota} from '../entities/wos-quota.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Email, WosQuota])],
    controllers: [EmailsController],
    providers: [EmailsService, PaginatorService],
    exports: [EmailsService]
})
export class EmailsModule {
}
