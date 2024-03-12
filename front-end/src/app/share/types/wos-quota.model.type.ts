import {Organization} from './organization.model.type';
import {WosQuotaYear} from './wos-quota-year.model.type';

export type WosQuota = {
  id: number;

  creation_date: string;

  update_date: string;

  name: string;

  organization_id: number;

  organization: Organization;

  wosQuotaYear: WosQuotaYear;

  is_active: string;
};
