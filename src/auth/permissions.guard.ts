import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DecodedJwtPayload } from 'src/dto/payloads.dto';
import { Permission } from './permission.enum';
import { PERMISSION_KEY } from './permissions.decorator';
import { Roles } from './roles';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;
    const { user }: { user: DecodedJwtPayload } = context
      .switchToHttp()
      .getRequest();
    const { role, permissions } = user;
    const userRolePermissions = Roles[role];
    const allUserPermissions = [...userRolePermissions, ...permissions];
    return requiredPermissions.every((permission) =>
      allUserPermissions?.includes(permission),
    );
  }
}
