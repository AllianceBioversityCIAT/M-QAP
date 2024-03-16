import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {
    ApiBasicAuth,
    ApiBearerAuth,
    ApiOkResponse,
    ApiProperty,
    ApiTags,
} from '@nestjs/swagger';
import {User} from '../entities/user.entity';
import {JwtAuthGuard} from './jwt-auth.guard';
import {RolesGuard} from './roles.guard';

class AuthCode {
    @ApiProperty()
    code: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private rolesGuard: RolesGuard) {
    }

    @ApiBasicAuth()
    @UseGuards(AuthGuard('AWS'))
    @Post('aws')
    awsAuth(@Request() req, @Body() authCode: AuthCode) {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({
        type: User,
        description: 'hit with Barer token to get logedin user profile'
    })
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({
        type: User,
        description: 'hit with Barer token to if you have responsibilities'
    })
    @Post('responsibilities')
    async checkMyResponsibilities(
        @Request() req,
        @Body('userId') userId: number,
        @Body('responsibilities') responsibilities: string[],
    ) {
        if (req.user.id !== userId) {
            return false;
        } else {
            if (responsibilities.length === 0) {
                return false;
            } else {
                return await this.rolesGuard.checkMyResponsibilities(userId, responsibilities);
            }
        }
    }
}
