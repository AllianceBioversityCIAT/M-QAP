import { Organization } from './organization.model.type';
import { TrainingCycle } from './training-cycle.model.type';

export type Prediction = {
  id: number;

  text: string;

  clarisa_id: number;

  clarisa: Organization;

  confidant: number;

  trainingCycle: TrainingCycle;
};
