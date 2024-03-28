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

@Controller()
export class AppController {
    constructor(
        private readonly doiService: DoiService,
        private handleService: HandleService,
        private ai: AI,
        private appService: AppService,
    ) {
    }

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

    @Post('/')
    async postInfo(
        @Query('apiKey') apiKey: string,
        @Body('link') link: string = null,
        @Body('include') include: string[],
        @Body('exclude') exclude: string[],
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

    @Get('/qa')
    async qaInfo(
        @Query('apiKey') apiKey: string,
        @Query('link') link: string = null,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        return this.handleService.getInfoByRepositoryLink(link, apiKeyEntity, [], []);
    }

    @Post('/qa')
    async postQaInfo(
        @Query('apiKey') apiKey: string,
        @Body('link') link: string = null,
        @Body('include') include: string[],
        @Body('exclude') exclude: string[],
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        return this.handleService.getInfoByRepositoryLink(link, apiKeyEntity, include, exclude);
    }

    @Get('/predict/:name')
    async predict(
        @Param('name') name: string = null,
        @Query('apiKey') apiKey: string,
        @Request() req: any,
    ) {
        await this.appService.validateApiKey(apiKey, req.route.path);
        return await this.ai.makePrediction(name);
    }

    @Get(['/available-wos-quota', '/available-wos-quota/:year'])
    async availableWosQuota(
        @Param('year') year: number,
        @Query('apiKey') apiKey: string,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        year = year ? year : (new Date).getFullYear();
        return await this.appService.getWosAvailableQuota(apiKeyEntity, year)
    }
}
