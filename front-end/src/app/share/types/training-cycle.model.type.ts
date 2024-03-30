import {Prediction} from './prediction.model.type';

export type TrainingCycle = {
  id: number;

  creation_date: string;

  update_date: string;

  text: string;

  training_is_completed: string;

  is_active: string;

  predictions: Prediction[];
};
