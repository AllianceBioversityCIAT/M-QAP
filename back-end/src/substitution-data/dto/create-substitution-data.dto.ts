import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateSubstitutionDataDto {
    @ApiProperty()
    @Expose()
    @IsString()
    find_text?: string;

    @ApiProperty()
    @Expose()
    @IsString()
    replace_text?: string;
}
