import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { SUPER_ADMIN_ROLES } from '../../common/guards/roles.guard';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account has been deactivated. Contact an Administrator.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // MULTI-OWNER RULE: Nodes 10, 11, 12 always resolve to Super Admin
    const isSuperAdmin = user.isSuperAdmin || SUPER_ADMIN_ROLES.includes(user.roleType);
    const effectiveNode = loginDto.workstationNode || user.assignedNode;

    const payload = {
      sub: user.id,
      username: user.username,
      roleType: user.roleType,
      isSuperAdmin,
      assignedNode: effectiveNode,
    };

    const accessToken = this.jwtService.sign(payload);

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log login
    await this.auditService.log({
      userId: user.id,
      node: effectiveNode as any,
      module: 'AUTH',
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { roleType: user.roleType, isSuperAdmin, workstationNode: effectiveNode },
      ipAddress,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        roleType: user.roleType,
        isSuperAdmin,
        assignedNode: effectiveNode,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        roleType: true,
        assignedNode: true,
        isSuperAdmin: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
