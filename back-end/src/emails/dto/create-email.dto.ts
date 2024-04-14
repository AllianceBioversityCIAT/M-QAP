import {Expose} from 'class-transformer';
import {IsBoolean, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateEmailDto {
    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    subject: string;

    @ApiProperty()
    @Expose()
    @IsString()
    email: string;

    @ApiProperty()
    @Expose()
    @IsString()
    email_body: string;

    @ApiProperty()
    @Expose()
    @IsBoolean()
    status: boolean;
}
