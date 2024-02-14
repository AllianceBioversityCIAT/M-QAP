import {CreateTrainingCycleDto} from "../training-cycle/dto/create-training-cycle.dto";

require('@tensorflow/tfjs');
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as path from 'path';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {catchError, map} from 'rxjs/operators';
import * as fs from 'fs';
import {firstValueFrom} from 'rxjs';
import {PredictionsService} from 'src/predictions/predictions.service';
import {TrainingCycleService} from 'src/training-cycle/training-cycle.service';
import {trainingRunner} from '../../predictions/src/training';
import {TrainingDataService} from '../training-data/training-data.service';
import {SocketsGateway} from '../sockets/sockets.gateway';
import {UpdateTrainingCycleDto} from '../training-cycle/dto/update-training-cycle.dto';

@Injectable()
export class AI {
    private readonly logger = new Logger(AI.name);
    model;
    clarisa;
    naturalModel;

    constructor(
        private httpService: HttpService,
        private predictionsService: PredictionsService,
        private training_cycle: TrainingCycleService,
        private trainingDataService: TrainingDataService,
        private socketsGateway: SocketsGateway,
    ) {
        this.init();
    }

    async init() {
        let lastCycle = null;
        try {
            const active_cycle = await this.training_cycle.findLatestOne(true);
            if (active_cycle) {
                lastCycle = active_cycle;
                const training_folder_path = path.join(process.cwd(), 'uploads/training-data/' + active_cycle.id);
                this.logger.log('Start Loading Trained Model ' + training_folder_path);
                this.model = await tf.loadLayersModel(
                    'file://' + training_folder_path + '/model.json',
                );
                this.naturalModel = await use.load();
                let rawData: any = fs.readFileSync(training_folder_path + '/clarisa_data.json');
                this.clarisa = JSON.parse(rawData);
                this.logger.log('Trained Model Loaded: ' + active_cycle.id);
            } else {
                throw new Error('No trained cycles.');
            }
        } catch (e) {
            if (lastCycle) {
                const updateTrainingCycleDto: UpdateTrainingCycleDto = {
                    training_is_completed: false,
                };
                await this.training_cycle.update(lastCycle.id, updateTrainingCycleDto);
                this.init();
            } else {
                this.logger.log('No Trained Model found.');
            }
        }
    }

    calculatePercent(percent) {
        return Math.round(percent * 100);
    }

    async makePrediction(value) {
        try {
            const todoEmbedding = await this.naturalModel.embed(value.toLowerCase());
            const results: any = this.model.predict(todoEmbedding);
            const clarisa_index = this.clarisa[results.argMax(1).dataSync()[0]];

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

    async getClarisaDataPartners(trainingFolderPath) {
        const clarisaData = await firstValueFrom(
            this.httpService
                .get(process.env.CLARISA_API + '/institutionsSimple')
                .pipe(
                    map((d: any) => d.data),
                    catchError((e) => {
                        return [];
                    }),
                ));
        await fs.writeFileSync(trainingFolderPath + '/clarisa_data.json', JSON.stringify(clarisaData));
        return clarisaData;
    }

    async startCycleTraining() {
        this.socketsGateway.emitTrainingProgress(1, 'Initializing...');
        const lastCycle = await this.training_cycle.findLatestOne();

        const now = new Date();
        const day = now.getDate().toString().length === 1 ? `0${now.getDate()}` : now.getDate();
        const date = `${now.toLocaleString('default', {month: 'short'})} ${day}, ${now.getFullYear()}`;
        const trainingCycle: CreateTrainingCycleDto = {
            text: `Cycle ${(lastCycle.id + 1).toString()} - ${date}`
        }
        await this.training_cycle.create(trainingCycle);

        const activeCycle = await this.training_cycle.findLatestOne();
        const trainingFolderPath = path.join(process.cwd(), 'uploads/training-data/' + activeCycle.id);

        this.socketsGateway.emitTrainingProgress(2, 'Collecting data...');

        fs.mkdirSync(trainingFolderPath, {recursive: true});

        const clarisaData = await this.getClarisaDataPartners(trainingFolderPath);

        const trainingData = (await this.trainingDataService.getAll()).map(item => {
            return {
                text: item.text,
                clarisa_id: item.clarisa_id,
            }
        });

        this.socketsGateway.emitTrainingProgress(3, 'Preparing data...');

        return trainingRunner(
            clarisaData,
            trainingData,
            async (type, data) => {
                if (type === 'compilingData') {
                    this.socketsGateway.emitTrainingProgress(data, 'Compiling data...');
                } else if (type === 'trainingStart') {
                    this.socketsGateway.emitTrainingProgress(data, 'Initializing AI...');
                } else if (type === 'epochEnd') {
                    this.socketsGateway.emitTrainingProgress(data + 5, 'Training AI...');
                } else if (type === 'trainingComplete') {
                    await data.save('file://' + trainingFolderPath);
                    const updateTrainingCycleDto: UpdateTrainingCycleDto = {
                        training_is_completed: true,
                    };
                    await this.training_cycle.update(activeCycle.id, updateTrainingCycleDto);
                    await this.init();
                    this.socketsGateway.emitTrainingProgress(0, 'Finished.');
                }
            });
    }
}
