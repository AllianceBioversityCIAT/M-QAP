import {SetMetadata} from '@nestjs/common';
import {Role} from './role.enum';

export const ROLES_KEY = 'role';

export type RoleObject = {
    role: Role[],
    responsibility: string[]
};
export const Roles = (role: Role[], responsibility?: string[]) => SetMetadata(ROLES_KEY, {
    role,
    responsibility,
});
