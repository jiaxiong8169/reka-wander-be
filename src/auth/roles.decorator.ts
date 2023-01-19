import { SetMetadata } from '@nestjs/common';

export type Role = string;
export const ROLE_KEYS = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLE_KEYS, roles);
