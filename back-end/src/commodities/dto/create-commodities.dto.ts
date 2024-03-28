import {Expose, Type} from 'class-transformer';
import {IsString} from 'class-validator';
import {Commodity} from 'src/entities/commodities.entity';
import {ApiProperty} from '@nestjs/swagger';

export class CreateCommoditiesDto {
    @ApiProperty()
    @Expose()
    @IsString()
    name: string;

    @ApiProperty()
    @Expose()
    @IsString()
    source: string;

    @ApiProperty()
    @Expose()
    @Type(() => Commodity)
    parent: Commodity;
}
