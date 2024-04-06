import {workerData, parentPort} from 'worker_threads';
import {
    ControlledListItem,
    EventEmitter,
    ProgressSettings,
    SubstitutionItem,
    TrainingItem,
    TrainingResponse
} from './interface';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs-node';

let activeTrainingModel = null;

async function run() {
    const result = await trainingRunner(
        workerData.epochs,
        workerData.trainingBatchSize,
        workerData.progressSettings,
        workerData.trainingFolderPath,
        workerData.controlledListData,
        workerData.trainingData,
        workerData.substitutionData,
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
    start: (controlledListData: ControlledListItem[], trainingData: TrainingItem[], substitutionData: SubstitutionItem[]) => {
        let {
            data,
            labels,
            controlledListIds
        } = prepareData.controlledList(controlledListData, [], [], substitutionData);
        const result = prepareData.trainingData(trainingData, data, labels, controlledListIds, substitutionData);

        return {
            data: result.data.map((d) => d.toLowerCase()),
            labels: result.labels,
        }
    },
    controlledList: (controlledListData: ControlledListItem[], data: string[], labels: number[], substitutionData: any) => {
        let controlledListLabels = controlledListData.map((d: any) => d.name);
        let controlledListIds = controlledListData.map((d: any) => d.code);

        // controlledListData.splice(0, 10).forEach((element) => {
        controlledListData.forEach((element) => {
            const originalName = element.name as string;
            const originalNameIndex = controlledListLabels.indexOf(originalName);

            const compositions = [
                originalName,
                `${originalName} ${element.hqLocation}`
            ];

            if (element.acronym && element.acronym != '' && element.acronym != null) {
                compositions.push(element.acronym);
                compositions.push(`${element.acronym} ${element.hqLocation}`);
                compositions.push(`${originalName} ${element.acronym} ${element.hqLocation}`);
            }

            const variants = prepareData.stringSubstitutions(compositions, substitutionData);
            variants.map(variant => {
                data.push(variant);
                labels.push(originalNameIndex);
            });
        });

        return {
            data,
            labels,
            controlledListIds,
        };
    },
    stringSubstitutions: (inputs: string[], substitutionData: SubstitutionItem[]) => {
        substitutionData.map(substitution => {
            const regex = new RegExp(`(\\W|^)(${substitution.find})(\\W|$)`, 'i');
            const subst = `$1${substitution.replace}$3`;

            const regexInverted = new RegExp(`(\\W|^)(${substitution.replace})(\\W|$)`, 'i');
            const substInverted = `$1${substitution.find}$3`;

            inputs.map(input => {
                const result = input.replace(regex, subst);
                if (inputs.indexOf(result) === -1) {
                    inputs.push(result);
                }

                const resultInverted = input.replace(regexInverted, substInverted);
                if (inputs.indexOf(resultInverted) === -1) {
                    inputs.push(resultInverted);
                }
            });
        });
        return inputs;
    },
    trainingData: (trainingData: TrainingItem[], data: string[], labels: number[], controlledListIds: number[], substitutionData: any) => {
        // trainingData.splice(0, 20).forEach((element) => {
        trainingData.forEach((element) => {
            const originalNameIndex = controlledListIds.indexOf(element.id);
            if (originalNameIndex != -1) {
                const variants = prepareData.stringSubstitutions([element.text], substitutionData);
                variants.map(variant => {
                    data.push(variant);
                    labels.push(originalNameIndex);
                });
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
    createModel: async (units: number) => {
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 256, activation: 'relu', inputShape: [512]}));
        model.add(tf.layers.dropout({rate: 0.5}));
        model.add(tf.layers.dense({units: units, activation: 'softmax'}));
        return model;
    },
    prepareDataset: async (numClasses: number, data: string[], labels: number[], trainingBatchSize: number) => {
        const modelEncoder = await tensorOperations.loadEncoderModel();

        async function* dataG(): any {
            for (let i = 0; i < data.length; i = i + trainingBatchSize) {
                const batch = data.slice(i, i + trainingBatchSize);
                yield await modelEncoder.embed(batch);
            }
        }

        async function* labelsG(): any {
            for (let i = 0; i < labels.length; i = i + trainingBatchSize) {
                yield tf.tidy((): any => {
                    const batch = labels.slice(i, i + trainingBatchSize);
                    const labelTensor = tf.tensor1d(batch, 'int32');
                    return tf.oneHot(labelTensor, numClasses);
                });
            }
        }

        const ys = tf.data.generator(labelsG);
        const xs = tf.data.generator(dataG);
        return tf.data
            .zip({xs, ys})
            .shuffle(trainingBatchSize)
            .batch(1)
            .prefetch(1);
    },
    trainModelDataset: async (model: tf.Sequential, dataset, dataLength: number, epochs: number, trainingBatchSize: number, eventEmitter: EventEmitter, progressSettings: ProgressSettings, trainingFolderPath: string) => {
        const progress = progressSettings.availablePercentageDistribution.trainingStart * (100 - progressSettings.reservedPercentage) / 100;
        eventEmitter('trainingStart', progress + progressSettings.reservedPercentage, model);

        const availablePercentage = progressSettings.availablePercentageDistribution.training * (100 - progressSettings.reservedPercentage) / 100;

        let currentEpoch = 0;
        const batchesCount = Math.ceil(dataLength / trainingBatchSize);
        const batches = epochs * batchesCount;

        const achievedProgress = progressSettings.reservedPercentage + progressSettings.availablePercentageDistribution.trainingStart;

        model.compile({
            loss: 'categoricalCrossentropy',
            optimizer: tf.train.adam(0.001),
            metrics: ['accuracy'],
        });

        model.fitDataset(dataset, {
            epochs,
            verbose: 0,
            callbacks: {
                onEpochBegin: (epoch) => {
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
    epochs: number,
    trainingBatchSize: number,
    progressSettings: ProgressSettings,
    trainingFolderPath: string,
    controlledListData: ControlledListItem[],
    trainingData: TrainingItem[],
    substitutionData: SubstitutionItem[],
    eventEmitter: EventEmitter,
): Promise<TrainingResponse> {
    try {
        const {data, labels} = prepareData.start(controlledListData, trainingData, substitutionData);
        const numClasses = controlledListData.length;
        const model = await tensorOperations.createModel(numClasses);

        const dataset = await tensorOperations.prepareDataset(numClasses, data, labels, trainingBatchSize);
        tensorOperations.trainModelDataset(
            model,
            dataset,
            labels.length,
            epochs,
            trainingBatchSize,
            eventEmitter,
            progressSettings,
            trainingFolderPath,
        );

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