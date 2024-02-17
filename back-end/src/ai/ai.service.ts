require('@tensorflow/tfjs');
import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {PredictionsService} from 'src/predictions/predictions.service';
import {AiTrainingService} from './ai-training.service';

@Injectable()
export class AI {
    constructor(
        private predictionsService: PredictionsService,
        private aiTrainingService: AiTrainingService,
    ) {
    }

    calculatePercent(percent) {
        return Math.round(percent * 100);
    }

    async makePrediction(value) {
        try {
            const todoEmbedding = await this.aiTrainingService.naturalModel.embed(value.toLowerCase());
            const results: any = this.aiTrainingService.model.predict(todoEmbedding);
            const clarisa_index = this.aiTrainingService.clarisa[results.argMax(1).dataSync()[0]];

            const confidant: number = this.calculatePercent(
                Math.max(...results.dataSync().map((d) => d)),
            );
            const clarisa_id = clarisa_index ? clarisa_index.code : null;

            this.predictionsService.create({confidant, clarisa_id, text: value});
            return {
                value: clarisa_index ? clarisa_index : null,
                confidant: this.calculatePercent(
                    Math.max(...results.dataSync().map((d) => d)),
                ),
            };
        } catch (e) {
            if (e.message && (e.message as string).indexOf(`reading 'embed'`) >= 0)
                throw new BadRequestException(
                    'please try again later AI is loading data',
                );
            else throw new InternalServerErrorException(e);
        }
    }
}
