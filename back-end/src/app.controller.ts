import {
    Controller,
    Get,
    Post,
    HttpException,
    HttpStatus,
    Param,
    Query,
    Request,
    Body,
} from '@nestjs/common';
import {AI} from './ai/ai.service';
import {DoiService} from './doi/doi.service';
import {HandleService} from './handle/handle.service';
import {AppService} from './app.service';
import {ApiBody, ApiOperation, ApiTags} from '@nestjs/swagger';
import {LinkRequestDto, apiRequests} from './link-request.dto';

@ApiTags('Main')
@Controller()
export class AppController {
    constructor(
        private readonly doiService: DoiService,
        private handleService: HandleService,
        private ai: AI,
        private appService: AppService,
    ) {
    }

    @ApiOperation({summary: 'Get information from DOI from all available APIs.'})
    @Get('/')
    async info(
        @Query('apiKey') apiKey: string,
        @Query('link') link: string = null,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        if (link) {
            const doi = this.doiService.isDOI(link);
            if (doi) {
                return this.doiService.getInfoByDOI(doi, apiKeyEntity, [], []);
            } else {
                throw new HttpException(
                    'Bad request valid DOI must be provided',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } else {
            throw new HttpException(
                'Bad request valid handle must be provided',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @ApiOperation({summary: 'Get information from DOI from the selected available APIs.'})
    @Post('/')
    @ApiBody({type: LinkRequestDto})
    async postInfo(
        @Query('apiKey') apiKey: string,
        @Body('link') link: string = null,
        @Body('include') include: apiRequests[],
        @Body('exclude') exclude: apiRequests[],
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        if (link) {
            const doi = this.doiService.isDOI(link);
            if (doi) {
                return this.doiService.getInfoByDOI(doi, apiKeyEntity, include, exclude);
            } else {
                throw new HttpException(
                    'Bad request valid DOI must be provided',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } else {
            throw new HttpException(
                'Bad request valid handle must be provided',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @ApiOperation({summary: 'Get information from CGIAR repositories from all available APIs.'})
    @Get('/qa')
    async qaInfo(
        @Query('apiKey') apiKey: string,
        @Query('link') link: string = null,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        return this.handleService.getInfoByRepositoryLink(link, apiKeyEntity, [], []);
    }

    @ApiOperation({summary: 'Get information from CGIAR repositories from the selected available APIs.'})
    @ApiBody({type: LinkRequestDto})
    @Post('/qa')
    async postQaInfo(
        @Query('apiKey') apiKey: string,
        @Body('link') link: string = null,
        @Body('include') include: apiRequests[],
        @Body('exclude') exclude: apiRequests[],
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        return this.handleService.getInfoByRepositoryLink(link, apiKeyEntity, include, exclude);
    }

    @ApiOperation({summary: 'Get institution AI matching prediction with CLARISA institutions list.'})
    @Get('/predict/:name')
    async predict(
        @Query('apiKey') apiKey: string,
        @Param('name') name: string = null,
        @Request() req: any,
    ) {
        await this.appService.validateApiKey(apiKey, req.route.path);
        return await this.ai.makePrediction(name);
    }

    @ApiOperation({summary: 'Get institution AI matching prediction and text matching with CLARISA institutions list.'})
    @Get('/predict-text-match/:name')
    async predictFuzzywuzzy(
        @Query('apiKey') apiKey: string,
        @Param('name') name: string = null,
        @Request() req: any,
    ) {
        return await this.ai.makePrediction(name, true);
    }

    @ApiOperation({summary: 'Get assigned WoS quota details.'})
    @Get(['/available-wos-quota', '/available-wos-quota/:year'])
    async availableWosQuota(
        @Query('apiKey') apiKey: string,
        @Param('year') year: number,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        year = year ? year : (new Date).getFullYear();
        return await this.appService.getWosAvailableQuota(apiKeyEntity, year)
    }
}
