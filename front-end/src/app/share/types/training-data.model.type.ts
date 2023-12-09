import { Organization } from './organization.model.type';

export type TrainingData = {
  id: number;

  creation_date: string;

  update_date: string;

  text: string;

  clarisa_id: number;

  clarisa: Organization;

  source: string;
};
