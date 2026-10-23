import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('Phase 1: RolesGuard (Server-Side Authorization & Multi-Owner Rights)', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('should allow access when no roles are specified on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ roleType: 'CUTTING_MASTER' });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow user possessing the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ACCOUNTS_HR_EXECUTIVE']);
    const context = createMockContext({
      roleType: 'ACCOUNTS_HR_EXECUTIVE',
      isSuperAdmin: false,
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('MULTI-OWNER RULE: Managing Director (Node 10) can access any protected role route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ACCOUNTS_HR_EXECUTIVE', 'FINANCE_MANAGER']);
    const context = createMockContext({
      roleType: 'MANAGING_DIRECTOR',
      isSuperAdmin: true,
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('MULTI-OWNER RULE: Partner / Director (Node 11) can access any protected role route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['QUALITY_MANAGER']);
    const context = createMockContext({
      roleType: 'DIRECTOR_PARTNER',
      isSuperAdmin: true,
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('MULTI-OWNER RULE: General Manager (Node 12) can access any protected role route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['STORE_INCHARGE']);
    const context = createMockContext({
      roleType: 'GENERAL_MANAGER',
      isSuperAdmin: true,
    });

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should strictly throw ForbiddenException when non-admin lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ACCOUNTS_HR_EXECUTIVE']);
    const context = createMockContext({
      roleType: 'CUTTING_MASTER',
      isSuperAdmin: false,
    });

    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });
});
