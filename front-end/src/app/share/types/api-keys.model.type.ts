import {Organization} from './organization.model.type';
import {User} from './user.model.type';

export type ApiKeys = {
  id: number;

  creation_date: string;

  update_date: string;

  name: string;

  organization_id: number;

  organization: Organization;

  user_id: number;

  user: User;

  wos_quota: string;

  api_key: string;

  is_active: string;
};
