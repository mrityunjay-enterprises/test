import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPER_ADMIN_ROLES } from './roles.guard';

export const ALLOWED_NODES_KEY = 'allowed_nodes';
export const AllowedNodes = (...nodes: string[]) => SetMetadata(ALLOWED_NODES_KEY, nodes);

@Injectable()
export class TerminalNodeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedNodes = this.reflector.getAllAndOverride<string[]>(ALLOWED_NODES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedNodes || allowedNodes.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    // MULTI-OWNER RULE: Admin Nodes (10, 11, 12) can access any terminal functionality
    if (user.isSuperAdmin || SUPER_ADMIN_ROLES.includes(user.roleType)) {
      return true;
    }

    const userNode = user.assignedNode;
    if (!userNode || !allowedNodes.includes(userNode)) {
      throw new ForbiddenException(
        `Workstation terminal [${userNode || 'UNASSIGNED'}] is not authorized for this operation. Allowed terminals: [${allowedNodes.join(', ')}]`,
      );
    }

    return true;
  }
}
