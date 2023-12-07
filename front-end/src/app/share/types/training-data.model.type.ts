import { Organization } from './organization.model.type';

export type TrainingData = {
  id: number;

  text: string;

  clarisa_id: number;

  clarisa: Organization;

  source: string;
};
