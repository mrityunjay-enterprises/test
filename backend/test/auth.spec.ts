import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/database/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';

describe('Phase 1: AuthService (Authentication & Multi-Owner Credentials)', () => {
  let authService: AuthService;
  let prismaService: any;
  let auditService: any;

  const mockPasswordHash = bcrypt.hashSync('securePass123', 8);

  const mockUsers = {
    md: {
      id: 'user-md-001',
      username: 'arun.kapoor',
      fullName: 'Arun Kapoor',
      email: 'arun@garmentflow.com',
      passwordHash: mockPasswordHash,
      roleType: 'MANAGING_DIRECTOR',
      assignedNode: 'NODE_10_ADMIN_MD',
      isSuperAdmin: true,
      isActive: true,
    },
    partner: {
      id: 'user-partner-002',
      username: 'rajesh.sharma',
      fullName: 'Rajesh Sharma',
      email: 'rajesh@garmentflow.com',
      passwordHash: mockPasswordHash,
      roleType: 'DIRECTOR_PARTNER',
      assignedNode: 'NODE_11_ADMIN_PARTNER',
      isSuperAdmin: true,
      isActive: true,
    },
    gm: {
      id: 'user-gm-003',
      username: 'vikram.singh',
      fullName: 'Vikram Singh',
      email: 'vikram@garmentflow.com',
      passwordHash: mockPasswordHash,
      roleType: 'GENERAL_MANAGER',
      assignedNode: 'NODE_12_ADMIN_GM',
      isSuperAdmin: true,
      isActive: true,
    },
    cuttingMaster: {
      id: 'user-cut-004',
      username: 'ramesh.cutting',
      fullName: 'Ramesh Sen',
      email: 'ramesh@garmentflow.com',
      passwordHash: mockPasswordHash,
      roleType: 'CUTTING_MASTER',
      assignedNode: 'NODE_04_CUTTING',
      isSuperAdmin: false,
      isActive: true,
    },
    deactivated: {
      id: 'user-deact-005',
      username: 'inactive.user',
      fullName: 'Inactive Operator',
      email: 'inactive@garmentflow.com',
      passwordHash: mockPasswordHash,
      roleType: 'SEWING_SUPERVISOR',
      assignedNode: 'NODE_05_SEWING',
      isSuperAdmin: false,
      isActive: false,
    },
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockUsers[where.username] || Object.values(mockUsers).find(u => u.username === where.username) || null);
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    auditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditService, useValue: auditService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should successfully log in Managing Director and assign isSuperAdmin = true', async () => {
    const result = await authService.login({
      username: 'arun.kapoor',
      password: 'securePass123',
    });

    expect(result).toHaveProperty('accessToken', 'mock.jwt.token');
    expect(result.user.username).toBe('arun.kapoor');
    expect(result.user.roleType).toBe('MANAGING_DIRECTOR');
    expect(result.user.isSuperAdmin).toBe(true);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'LOGIN',
        entityId: 'user-md-001',
      }),
    );
  });

  it('should treat all 3 Admin Nodes (MD, Partner, GM) as identical Super Admins', async () => {
    const partnerResult = await authService.login({
      username: 'rajesh.sharma',
      password: 'securePass123',
    });
    expect(partnerResult.user.isSuperAdmin).toBe(true);
    expect(partnerResult.user.roleType).toBe('DIRECTOR_PARTNER');

    const gmResult = await authService.login({
      username: 'vikram.singh',
      password: 'securePass123',
    });
    expect(gmResult.user.isSuperAdmin).toBe(true);
    expect(gmResult.user.roleType).toBe('GENERAL_MANAGER');
  });

  it('should successfully log in shop floor cutting master with standard non-admin rights', async () => {
    const result = await authService.login({
      username: 'ramesh.cutting',
      password: 'securePass123',
    });

    expect(result.user.isSuperAdmin).toBe(false);
    expect(result.user.roleType).toBe('CUTTING_MASTER');
    expect(result.user.assignedNode).toBe('NODE_04_CUTTING');
  });

  it('should reject login with invalid password', async () => {
    await expect(
      authService.login({
        username: 'arun.kapoor',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login for non-existent username', async () => {
    await expect(
      authService.login({
        username: 'ghost.user',
        password: 'anyPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login for deactivated account', async () => {
    await expect(
      authService.login({
        username: 'inactive.user',
        password: 'securePass123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
