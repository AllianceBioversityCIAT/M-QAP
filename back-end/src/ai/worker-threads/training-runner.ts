import {workerData, parentPort} from 'worker_threads';
import {
    ControlledListItem,
    EventEmitter,
    ProgressSettings,
    TrainingItem,
    TrainingResponse
} from './interface';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-node';
import {UniversalSentenceEncoder} from '@tensorflow-models/universal-sentence-encoder';
import {Tensor} from '@tensorflow/tfjs-core/dist/tensor';

let activeTrainingModel = null;

async function run() {
    const result = await trainingRunner(
        workerData.loadDataPatchSize,
        workerData.epochs,
        workerData.trainingPatchSize,
        workerData.progressSettings,
        workerData.trainingFolderPath,
        workerData.controlledListData,
        workerData.trainingData,
        (type, progress, model) => {
            activeTrainingModel = model;
            parentPort.postMessage({
                processing: {type, progress}
            });
        });

    parentPort.postMessage({
        result
    });

    parentPort.on('message', async (message) => {
        if (message?.stopTraining && message.stopTraining === true) {
            activeTrainingModel.stopTraining = true;
        }
    });
}


const prepareData = {
    start: (controlledListData: ControlledListItem[], trainingData: TrainingItem[]) => {
        let {data, labels, controlledListIds} = prepareData.controlledList(controlledListData, [], []);
        const result = prepareData.trainingData(trainingData, data, labels, controlledListIds);
        return {
            data: result.data.map((d) => d.toLowerCase()),
            labels: result.labels,
        }
    },
    controlledList: (controlledListData: ControlledListItem[], data: string[], labels: number[]) => {
        let controlledListLabels = controlledListData.map((d: any) => d.name);
        let controlledListIds = controlledListData.map((d: any) => d.code);

        // controlledListData.splice(0, 10).forEach((element) => {
        controlledListData.forEach((element) => {
            data.push(element.name as string);
            labels.push(controlledListLabels.indexOf(element.name));
            if (element.acronym && element.acronym != '' && element.acronym != null) {
                data.push(element.acronym);
                labels.push(controlledListLabels.indexOf(element.name));
            }
            if (element.name.indexOf('University') >= 0) {
                data.push(element.name.replace('University', 'Univ'));
                labels.push(controlledListLabels.indexOf(element.name));
            }
            if (element.name.indexOf('&') >= 0 && element.name.indexOf(' & ') < 0) {
                data.push(element.name.replace('&', ' and '));
                labels.push(controlledListLabels.indexOf(element.name));

                data.push(element.name.replace('&', ' & '));
                labels.push(controlledListLabels.indexOf(element.name));
            }

            if (element.name.indexOf(' and ') >= 0) {
                data.push(element.name.replace(' and ', ' & '));
                labels.push(controlledListLabels.indexOf(element.name));
            }
            data.push(
                `${element.name}${element.acronym != '' ? ' ' + element.acronym : ''} ${element.hqLocation}`
            );
            labels.push(controlledListLabels.indexOf(element.name));
        });

        return {
            data,
            labels,
            controlledListIds,
        };
    },
    trainingData: (trainingData: TrainingItem[], data: string[], labels: number[], controlledListIds: number[]) => {
        trainingData.forEach((element) => {
            if (controlledListIds.indexOf(element.id) != -1) {
                data.push(element.text as string);
                labels.push(controlledListIds.indexOf(element.id));
                if ((element.text as string).indexOf(',')) {
                    data.push((element.text as string).replace(',', ''));
                    labels.push(controlledListIds.indexOf(element.id));
                }
                data.push((element.text as string).toLowerCase());
                labels.push(controlledListIds.indexOf(element.id));
            }
        });
        return {
            data,
            labels,
        }
    },
}

const tensorOperations = {
    loadEncoderModel: async () => {
        return await use.load();
    },
    createModel: async (labels: number[]) => {
        const model = tf.sequential();
        model.add(
            tf.layers.dense({
                inputDim: 512,
                units: 128,
                activation: 'sigmoid'
            })
        );
        model.add(
            tf.layers.dense({
                units: labels.length,
                activation: 'softmax',
            })
        );

        return model;
    },
    convertToTensor: async (data: string[], labels: number[], loadDataPatchSize: number, eventEmitter: EventEmitter, progressSettings: ProgressSettings) => {
        const model = await tensorOperations.loadEncoderModel();
        const todoEmbedding = await tensorOperations.embedSentencesInBatches(model, data, loadDataPatchSize, eventEmitter, progressSettings);

        return tf.tidy((): any => {
            tf.util.shuffle(data);
            const inputTensor = todoEmbedding;
            const labelTensor = tf.tensor1d(labels, 'int32');

            return {
                inputs: inputTensor,
                labels: tf.oneHot(labelTensor, data.length),
            };
        });
    },
    embedSentencesInBatches: async (model: UniversalSentenceEncoder, data: string[], loadDataPatchSize: number, eventEmitter: EventEmitter, progressSettings: ProgressSettings) => {
        const embeddings = [];
        for (let i = 0; i < data.length; i += loadDataPatchSize) {
            const batchSentences = data.slice(i, i + loadDataPatchSize);
            const batchEmbeddings = await model.embed(batchSentences);
            embeddings.push(batchEmbeddings);

            const availablePercentage = progressSettings.availablePercentageDistribution.compiling * (100 - progressSettings.reservedPercentage) / 100;
            const progress = (i + loadDataPatchSize) / data.length * availablePercentage;
            eventEmitter('compilingData', progress + progressSettings.reservedPercentage, null);
        }
        return tf.concat(embeddings);
    },
    trainModel: (model: tf.Sequential, dataLength: number, inputs: tf.Tensor2D, labels: Tensor, epochs: number, trainingPatchSize: number, eventEmitter: EventEmitter, progressSettings: ProgressSettings, trainingFolderPath: string) => {
        const progress = progressSettings.availablePercentageDistribution.trainingStart * (100 - progressSettings.reservedPercentage) / 100;
        eventEmitter('trainingStart', progress + progressSettings.reservedPercentage + progressSettings.availablePercentageDistribution.compiling, model);

        model.compile({
            loss: 'categoricalCrossentropy',
            optimizer: tf.train.adam(0.001),
            metrics: ['accuracy'],
        });
        const availablePercentage = progressSettings.availablePercentageDistribution.training * (100 - progressSettings.reservedPercentage) / 100;

        let currentEpoch = 0;
        const batchesCount = Math.ceil(dataLength / trainingPatchSize);
        const batches = epochs * batchesCount;

        const achievedProgress = progressSettings.reservedPercentage + progressSettings.availablePercentageDistribution.compiling + progressSettings.availablePercentageDistribution.trainingStart;
        model.fit(inputs, labels, {
            epochs,
            shuffle: true,
            batchSize: trainingPatchSize,
            verbose: 0,
            callbacks: {
                onEpochBegin:(epoch) => {
                    currentEpoch = epoch;
                },
                onBatchEnd: (batch) => {
                    const currentBatch = (currentEpoch * batchesCount) + (batch + 1);
                    let currentProgress = (currentBatch / batches * availablePercentage) + achievedProgress;
                    currentProgress = currentProgress > 100 ? 100 : currentProgress;
                    eventEmitter(
                        'epochEnd',
                        currentProgress,
                        model,
                    );
                },
            }
        })
            .then(async () => {
                await model.save('file://' + trainingFolderPath);
                eventEmitter('trainingComplete', 0, model)
            })
            .catch((e) => {
                console.log(e);
            });
    },
}

export async function trainingRunner(
    loadDataPatchSize: number,
    epochs: number,
    trainingPatchSize: number,
    progressSettings: ProgressSettings,
    trainingFolderPath: string,
    controlledListData: ControlledListItem[],
    trainingData: TrainingItem[],
    eventEmitter: EventEmitter,
): Promise<TrainingResponse> {
    try {
        const {data, labels} = prepareData.start(controlledListData, trainingData);
        const model = await tensorOperations.createModel(labels);
        const tensorData: any = await tensorOperations.convertToTensor(data, labels, loadDataPatchSize, eventEmitter, progressSettings);

        tensorOperations.trainModel(model, labels.length, tensorData.inputs, tensorData.labels, epochs, trainingPatchSize, eventEmitter, progressSettings, trainingFolderPath);

        return {
            started: true,
            training_records: labels.length,
        }
    } catch (e) {
        return {
            started: false,
            training_records: 0,
            error: e,
        }
    }
}

run();