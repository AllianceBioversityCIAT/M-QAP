import { userRole } from './user-role.type';

export type User = {
  id: number;

  creation_date: string;

  update_date: string;

  email: string;

  first_name: string;

  last_name: string;

  role: userRole;

  full_name: string;
};
