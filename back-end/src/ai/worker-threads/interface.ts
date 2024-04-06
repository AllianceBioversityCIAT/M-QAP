export interface TrainingResponse {
    started: boolean;
    training_records: number;
    error?: any;
}

export interface SubstitutionItem {
    find: string;
    replace: string;
}

export interface TrainingItem {
    text: string;
    id: number;
}

export interface ControlledListItem {
    code: number;
    acronym: string;
    hqLocation: string;
    hqLocationISOalpha2: string;
    institutionType: string;
    institutionTypeId: number;
    name: string;
    websiteLink: string;
}

export interface ProgressSettings {
    reservedPercentage: number;
    availablePercentage: number;
    availablePercentageDistribution: {
        compiling: number,
        trainingStart: number,
        training: number,
    };
}

export interface EventEmitter {
    (type: string, progress: number, model: any): void;
}