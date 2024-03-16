import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {UsersModule} from 'src/users/users.module';
import {AuthService} from './auth.service';
import {LocalStrategy} from './local.strategy';
import {AuthController} from './auth.controller';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {RolesGuard} from './roles.guard';
import {AwsStrategy} from './aws.strategy';
import {HttpModule} from '@nestjs/axios';
import {AdminRolesGuard} from './admin-roles.guard';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {PrivilegesService} from './privileges.service';

@Module({
    imports: [
        HttpModule,
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_SECRET_KEY'),
                    signOptions: {
                        expiresIn: config.get<string | number>('JWT_EXPIRATION_TIME'),
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        AwsStrategy,
        JwtStrategy,
        RolesGuard,
        AdminRolesGuard,
        ConfigService,
        PrivilegesService,
    ],
    controllers: [AuthController],
    exports: [JwtModule, RolesGuard, PrivilegesService],
})
export class AuthModule {
}
