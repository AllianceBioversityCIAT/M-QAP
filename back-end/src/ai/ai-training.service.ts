import {CreateTrainingCycleDto} from '../training-cycle/dto/create-training-cycle.dto';

require('@tensorflow/tfjs');
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as path from 'path';
import {BadRequestException, HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {catchError, map} from 'rxjs/operators';
import * as fs from 'fs';
import {firstValueFrom} from 'rxjs';
import {TrainingCycleService} from 'src/training-cycle/training-cycle.service';
import {TrainingDataService} from '../training-data/training-data.service';
import {SocketsGateway} from '../sockets/sockets.gateway';
import {UpdateTrainingCycleDto} from '../training-cycle/dto/update-training-cycle.dto';
import {Worker} from 'worker_threads';
import workerThreadFilePath from './worker-threads/config';
import {OrganizationsService} from '../organizations/organizations.service';
import {Not} from 'typeorm';
import {SubstitutionDataService} from '../substitution-data/substitution-data.service';

@Injectable()
export class AiTrainingService {
    private readonly logger = new Logger(AiTrainingService.name);
    model;
    clarisa;
    naturalModel;
    activeCycleId: number = null;
    activeTrainingCycleId: number = null;
    activeTrainingWorker;
    activeTrainingAbortSignal = false;

    constructor(
        private httpService: HttpService,
        private trainingCycleService: TrainingCycleService,
        private trainingDataService: TrainingDataService,
        private socketsGateway: SocketsGateway,
        private organizationService: OrganizationsService,
        private substitutionDataService: SubstitutionDataService,
    ) {
        this.init();
    }

    async init() {
        let lastCycle = null;
        this.activeCycleId = null;
        try {
            const active_cycle = await this.trainingCycleService.findLatestActiveOne();
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
                await this.trainingCycleService.update({id: lastCycle.id}, updateTrainingCycleDto);
                await this.init();
            } else {
                this.logger.log('No Trained Model found.');
            }
        }
    }

    async getClarisaDataPartners(trainingFolderPath) {
        const clarisaData = await firstValueFrom(
            this.httpService
                .get(process.env.CLARISA_API + '/institutions/simple')
                .pipe(
                    map((d: any) => d.data),
                    catchError((e) => {
                        return [];
                    }),
                ))
            .catch(async (e) => {
                const activeCycle = await this.trainingCycleService.findLatestActiveOne();
                const activeFolderPath = path.join(process.cwd(), 'uploads/training-data/' + activeCycle.id);
                return JSON.parse(fs.readFileSync(activeFolderPath + '/clarisa_data.json', 'utf8'));
            });
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
        const lastCycleId = lastCycle && lastCycle?.id ? lastCycle.id : 0;

        const now = new Date();
        const day = now.getDate().toString().length === 1 ? `0${now.getDate()}` : now.getDate();
        const date = `${now.toLocaleString('default', {month: 'short'})} ${day}, ${now.getFullYear()}`;
        const trainingCycle: CreateTrainingCycleDto = {
            text: `Cycle ${(lastCycleId + 1).toString()} - ${date}`
        }
        await this.trainingCycleService.create(trainingCycle);

        const currentCycle = await this.trainingCycleService.findLatestOne();
        this.activeTrainingCycleId = currentCycle.id;
        const trainingFolderPath = path.join(process.cwd(), 'uploads/training-data/' + currentCycle.id);

        this.socketsGateway.emitTrainingProgress(2, 'Collecting data...', false);

        fs.mkdirSync(trainingFolderPath, {recursive: true});

        const controlledListData = await this.getClarisaDataPartners(trainingFolderPath);

        const trainingData = (await this.trainingDataService.getAll()).map(item => {
            return {
                text: item.text,
                id: item.clarisa_id,
            }
        });

        const substitutionData = await this.substitutionDataService.getAll();

        this.socketsGateway.emitTrainingProgress(3, 'Preparing data...', false);

        const progressSettings = {
            reservedPercentage: 3,
            availablePercentage: 97,
            availablePercentageDistribution: {
                trainingStart: 1,
                training: 99,
            },
        };

        const worker = new Worker(workerThreadFilePath, {
            workerData: {
                epochs: 60,
                trainingBatchSize: 128,
                progressSettings,
                trainingFolderPath,
                controlledListData,
                trainingData,
                substitutionData,
            },
        });

        this.activeTrainingWorker = worker;
        worker.on('message', async (message) => {
            if (message?.processing) {
                const {type, progress} = message.processing;
                if (type === 'compilingData') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Compiling data...', false);
                } else if (type === 'trainingStart') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Initializing AI...', false);
                } else if (type === 'epochEnd') {
                    this.socketsGateway.emitTrainingProgress(progress, 'Training AI...', true);
                } else if (type === 'trainingComplete') {
                    this.activeTrainingCycleId = null;
                    worker.terminate();

                    if (!this.activeTrainingAbortSignal) {
                        const updateTrainingCycleDto: UpdateTrainingCycleDto = {
                            training_is_completed: true,
                        };

                        await this.trainingCycleService.update({id: currentCycle.id}, updateTrainingCycleDto);
                        await this.setActiveCycle(currentCycle.id);
                        await this.organizationService.importPartners(controlledListData);
                        await this.init();
                        this.socketsGateway.emitTrainingProgress(0, 'Finished', false);
                    } else {
                        this.activeTrainingAbortSignal = false;
                        await this.trainingCycleService.remove(currentCycle.id);
                        this.socketsGateway.emitTrainingProgress(0, 'Terminated', false);
                        const trainingFolderPathParts = trainingFolderPath.split('uploads/');
                        if (trainingFolderPathParts?.[1] && trainingFolderPathParts[1] === 'training-data/' + currentCycle.id) {
                            fs.rmSync(trainingFolderPath, {recursive: true, force: true});
                        }
                    }
                }
            } else if (message?.result) {
                return message.result;
            }
        });
        worker.on('error', (e) => {
            this.socketsGateway.emitTrainingProgress(0, 'Terminated', false);
            worker.terminate();
        });
        worker.on('exit', (code) => {
            this.activeTrainingWorker = null;
        });
    }

    cancelCycleTraining() {
        if (this.activeTrainingWorker) {
            this.activeTrainingWorker.postMessage({
                stopTraining: true
            });
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

    async setActiveCycle(id: number) {
        const trainingCycle = await this.trainingCycleService.findOne(id);
        if (trainingCycle.training_is_completed) {
            const updateTrainingCycleDto: UpdateTrainingCycleDto = {
                is_active: true,
            }
            const updated = await this.trainingCycleService.update({id}, {...updateTrainingCycleDto});

            updateTrainingCycleDto.is_active = false;
            await this.trainingCycleService.update({id: Not(id)}, {...updateTrainingCycleDto});
            await this.init();
            return updated;
        } else {
            throw new BadRequestException('Cannot set as active, this training cycle training was not completed.');
        }
    }
}
