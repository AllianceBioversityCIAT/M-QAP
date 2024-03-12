import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Query,
    Request,
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
        @Query('link') link: string = null,
        @Query('handle') handle: string,
        @Query('apiKey') apiKey: string,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        if (link) {
            const doi = this.doiService.isDOI(link);
            if (doi) return this.doiService.getInfoByDOI(doi, apiKeyEntity);
            else
                throw new HttpException(
                    'Bad request valid DOI must be provided',
                    HttpStatus.BAD_REQUEST,
                );
        } else if (handle) {
            return this.handleService.getInfoByHandle(handle, apiKeyEntity);
        } else
            throw new HttpException(
                'Bad request valid handle must be provided',
                HttpStatus.BAD_REQUEST,
            );
    }

    @Get('/qa')
    async qaInfo(
        @Query('link') link: string = null,
        @Query('apiKey') apiKey: string,
        @Request() req: any,
    ) {
        const apiKeyEntity = await this.appService.validateApiKey(apiKey, req.route.path);
        if (link) {
            return this.handleService.getInfoByHandle(link, apiKeyEntity);
        } else
            throw new HttpException(
                'Bad request valid handle must be provided',
                HttpStatus.BAD_REQUEST,
            );
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
