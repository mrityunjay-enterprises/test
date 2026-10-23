import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

export const SUPER_ADMIN_ROLES = [
  'MANAGING_DIRECTOR',
  'DIRECTOR_PARTNER',
  'GENERAL_MANAGER',
];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // MULTI-OWNER RULE: Nodes 10 (MD), 11 (Partner), 12 (GM) have identical full super-admin access
    if (user.isSuperAdmin || SUPER_ADMIN_ROLES.includes(user.roleType)) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.roleType);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires role [${requiredRoles.join(', ')}], user has [${user.roleType}]`,
      );
    }

    return true;
  }
}
