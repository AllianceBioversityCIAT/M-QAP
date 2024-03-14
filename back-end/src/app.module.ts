import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AI} from './ai/ai.service';
import {AiTrainingModule} from './ai/ai-training.module';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DoiService} from './doi/doi.service';
import {FormatService} from './handle/formatter.service';
import {HandleService} from './handle/handle.service';
import {HttpModule} from '@nestjs/axios';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {TrainingDataModule} from './training-data/training-data.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TrainingCycleModule} from './training-cycle/training-cycle.module';
import {PredictionsModule} from './predictions/predictions.module';
import {OrganizationsModule} from './organizations/organizations.module';
import {DashboardController} from './dashboard/dashboard.controller';
import {MediaModule} from './media/media.module';
import {CommoditiesModule} from './commodities/commodities.module';
import {AuthModule} from './auth/auth.module';
import {StatisticsModule} from './statistics/statistics.module';
import {SocketsModule} from './sockets/sockets.module';
import {RepositoriesModule} from './repositories/repositories.module';
import {UsersModule} from './users/users.module';
import {ApiKeysModule} from './api-keys/api-keys.module';
import {PaginatorService} from './paginator/paginator.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            type: 'mysql',
            synchronize: true,
            entities: [`dist/**/*.entity{.ts,.js}`],
            autoLoadEntities: true,
            namingStrategy: new SnakeNamingStrategy(),
        }),
        SocketsModule,
        HttpModule,
        TrainingDataModule,
        TrainingCycleModule,
        PredictionsModule,
        OrganizationsModule,
        MediaModule,
        AuthModule,
        CommoditiesModule,
        StatisticsModule,
        AiTrainingModule,
        RepositoriesModule,
        UsersModule,
        ApiKeysModule,
    ],
    controllers: [AppController, DashboardController],
    providers: [AppService, DoiService, AI, HandleService, FormatService, PaginatorService],
    exports: [PaginatorService]
})
export class AppModule {
}
