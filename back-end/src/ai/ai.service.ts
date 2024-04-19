require('@tensorflow/tfjs');
import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {PredictionsService} from 'src/predictions/predictions.service';
import {AiTrainingService} from './ai-training.service';

const fuzz = require('fuzzball');

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

    pickHighest(obj: any, num = 1) {
        const items = {};
        if (num > Object.keys(obj).length) {
            return false;
        }
        Object.keys(obj).sort((a, b) => obj[b] - obj[a]).forEach((key, ind) => {
            if (ind < num) {
                items[key] = obj[key];
            }
        });
        return items;
    }

    async makePrediction(value: string, fuzzywuzzy = false, top10 = false) {
        try {
            const todoEmbedding = await this.aiTrainingService.naturalModel.embed(value.toLowerCase());
            const results: any = this.aiTrainingService.model.predict(todoEmbedding);
            const clarisa_index = this.aiTrainingService.clarisa[results.argMax(1).dataSync()[0]];

            const top10Predictions = [];
            if (top10) {
                const predictionsResults = results.dataSync();
                const topPredictions = this.pickHighest(predictionsResults, 10);

                for (const clarisIndex in topPredictions) {
                    const confidant: number = this.calculatePercent(topPredictions[clarisIndex]);
                    if (confidant > 0) {
                        top10Predictions.push({
                            value: this.aiTrainingService.clarisa[clarisIndex],
                            confidant: this.calculatePercent(topPredictions[clarisIndex])
                        });
                    }
                }
                top10Predictions.sort((a, b) => b.confidant - a.confidant);
            }

            const confidant: number = this.calculatePercent(
                Math.max(...results.dataSync().map((d) => d)),
            );
            const clarisa_id = clarisa_index ? clarisa_index.code : null;

            this.predictionsService.create({confidant, clarisa_id, text: value});
            if (fuzzywuzzy) {
                return {
                    value: clarisa_index ? clarisa_index : null,
                    confidant: this.calculatePercent(
                        Math.max(...results.dataSync().map((d) => d)),
                    ),
                    fuzzywuzzy: await this.fuzzBall(value),
                    top10Predictions: top10 ? top10Predictions : null,
                };
            } else {
                return {
                    value: clarisa_index ? clarisa_index : null,
                    confidant: this.calculatePercent(
                        Math.max(...results.dataSync().map((d) => d)),
                    ),
                    top10Predictions: top10 ? top10Predictions : null,
                };
            }
        } catch (e) {
            if (e.message && (e.message as string).indexOf(`reading 'embed'`) >= 0)
                throw new BadRequestException(
                    'please try again later AI is loading data',
                );
            else throw new InternalServerErrorException(e);
        }
    }

    async fuzzBall(search) {
        const organizations = this.aiTrainingService.clarisa.map((organization: any) => `${organization.name} ${organization.acronym}`);

        const fuzzywuzzyMatch = await fuzz.extractAsPromised(search, organizations, {
            scorer: fuzz.token_set_ratio,
            limit: 1,
            sortBySimilarity: true,
        });

        const fuzzywuzzy = {
            value: null,
            confidant: 0,
        };
        if (fuzzywuzzyMatch?.[0]) {
            fuzzywuzzy.confidant = fuzzywuzzyMatch[0][1];
            const bestMatchIndex = fuzzywuzzyMatch[0][2];
            fuzzywuzzy.value = this.aiTrainingService.clarisa[bestMatchIndex];
        }
        return fuzzywuzzy;
    }
}
