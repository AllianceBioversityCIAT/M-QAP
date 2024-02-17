import {CreateTrainingCycleDto} from '../training-cycle/dto/create-training-cycle.dto';

require('@tensorflow/tfjs');
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as path from 'path';
import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {catchError, map} from 'rxjs/operators';
import * as fs from 'fs';
import {firstValueFrom} from 'rxjs';
import {TrainingCycleService} from 'src/training-cycle/training-cycle.service';
import {trainingRunner} from '../../predictions/src';
import {TrainingDataService} from '../training-data/training-data.service';
import {SocketsGateway} from '../sockets/sockets.gateway';
import {UpdateTrainingCycleDto} from '../training-cycle/dto/update-training-cycle.dto';

@Injectable()
export class AiTrainingService {
    private readonly logger = new Logger(AiTrainingService.name);
    model;
    clarisa;
    naturalModel;
    activeCycleId: number = null;
    activeTrainingCycleId: number = null;
    activeTrainingModel;
    activeTrainingAbortSignal = false;

    constructor(
        private httpService: HttpService,
        private trainingCycleService: TrainingCycleService,
        private trainingDataService: TrainingDataService,
        private socketsGateway: SocketsGateway,
    ) {
        this.init();
    }
    async init() {
        let lastCycle = null;
        this.activeCycleId = null;
        try {
            const active_cycle = await this.trainingCycleService.findLatestOne(true);
            if (active_cycle) {
                lastCycle = active_cycle;
                this.activeCycleId = active_cycle.id;
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
                await this.trainingCycleService.update(lastCycle.id, updateTrainingCycleDto);
                this.init();
            } else {
                this.logger.log('No Trained Model found.');
            }
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
        if (this.activeTrainingCycleId) {
            throw new HttpException(
                'Another training cycle is in progress, please wait until the training is completed or cancel the active training cycle to start a new one.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } else {
            // Fake ID, to prevent multiple requests at the same time
            this.activeTrainingCycleId = -1;
        }

        this.socketsGateway.emitTrainingProgress(1, 'Initializing...', false);
        const lastCycle = await this.trainingCycleService.findLatestOne();

        const now = new Date();
        const day = now.getDate().toString().length === 1 ? `0${now.getDate()}` : now.getDate();
        const date = `${now.toLocaleString('default', {month: 'short'})} ${day}, ${now.getFullYear()}`;
        const trainingCycle: CreateTrainingCycleDto = {
            text: `Cycle ${(lastCycle.id + 1).toString()} - ${date}`
        }
        await this.trainingCycleService.create(trainingCycle);

        const activeCycle = await this.trainingCycleService.findLatestOne();
        this.activeTrainingCycleId = activeCycle.id;
        const trainingFolderPath = path.join(process.cwd(), 'uploads/training-data/' + activeCycle.id);

        this.socketsGateway.emitTrainingProgress(2, 'Collecting data...', false);

        fs.mkdirSync(trainingFolderPath, {recursive: true});

        const clarisaData = await this.getClarisaDataPartners(trainingFolderPath);

        const trainingData = (await this.trainingDataService.getAll()).map(item => {
            return {
                text: item.text,
                id: item.clarisa_id,
            }
        });

        this.socketsGateway.emitTrainingProgress(3, 'Preparing data...', false);

        const progressSettings = {
            reservedPercentage: 3,
            availablePercentage: 97,
            availablePercentageDistribution: {
                compiling: 19,
                trainingStart: 1,
                training: 80,
            },
        };
        return trainingRunner(
            1000,
            100,
            50,
            progressSettings,
            clarisaData,
            trainingData,
            async (type, progress, model) => {
                this.activeTrainingModel = model;
                if (type === 'compilingData') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Compiling data...', false);
                } else if (type === 'trainingStart') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Initializing AI...', false);
                } else if (type === 'epochEnd') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Training AI...', true);
                } else if (type === 'trainingComplete') {
                    await model.save('file://' + trainingFolderPath);
                    this.activeTrainingModel = null;
                    this.activeTrainingCycleId = null;

                    if (!this.activeTrainingAbortSignal) {
                        const updateTrainingCycleDto: UpdateTrainingCycleDto = {
                            training_is_completed: true,
                        };

                        await this.trainingCycleService.update(activeCycle.id, updateTrainingCycleDto);
                        await this.init();
                        this.socketsGateway.emitTrainingProgress(0, 'Finished', false);
                    } else {
                        this.activeTrainingAbortSignal = false;
                        await this.trainingCycleService.remove(activeCycle.id);
                        this.socketsGateway.emitTrainingProgress(0, 'Terminated', false);
                        const trainingFolderPathParts = trainingFolderPath.split('uploads/');
                        if (trainingFolderPathParts?.[1] && trainingFolderPathParts[1] === 'training-data/' + activeCycle.id) {
                            fs.rmSync(trainingFolderPath, {recursive: true, force: true});
                        }
                    }
                }
            });
    }

    cancelCycleTraining() {
        if (this.activeTrainingModel) {
            this.activeTrainingModel.stopTraining = true;
            this.activeTrainingAbortSignal = true;
            return {
                stopped: true,
                message: 'Active training cycle termination signal received successfully.'
            };
        } else {
            return {
                stopped: false,
                message: 'No active training cycles.'
            };
        }
    }
}
