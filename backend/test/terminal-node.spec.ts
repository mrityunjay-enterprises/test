import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TerminalNodeGuard } from '../src/common/guards/terminal-node.guard';
import { RbacService } from '../src/modules/rbac/rbac.service';

describe('Phase 1: TerminalNodeGuard & RbacService (12-Node Workstation Boundary)', () => {
  let terminalGuard: TerminalNodeGuard;
  let reflector: Reflector;
  let rbacService: RbacService;

  beforeEach(() => {
    reflector = new Reflector();
    terminalGuard = new TerminalNodeGuard(reflector);
    rbacService = new RbacService();
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

  describe('12-Node Permission Matrix (RbacService)', () => {
    it('should configure all 12 operational workstation nodes', () => {
      const nodes = rbacService.getAllNodes();
      expect(nodes.length).toBe(12);
    });

    it('Store Node 03 can access inventory and fabric GRN, but is blocked from payroll and pricing', () => {
      expect(rbacService.isModulePermitted('NODE_03_STORE', 'inventory')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_03_STORE', 'fabric_grn')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_03_STORE', 'payroll')).toBe(false);
      expect(rbacService.isModulePermitted('NODE_03_STORE', 'tax_invoices')).toBe(false);
    });

    it('Cutting Node 04 can access lay schedule and cut order reports, but is blocked from customer billing', () => {
      expect(rbacService.isModulePermitted('NODE_04_CUTTING', 'cut_order_reports')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_04_CUTTING', 'bundle_tickets')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_04_CUTTING', 'tax_invoices')).toBe(false);
    });

    it('Sewing Node 05 can access stitching, bundle scan, and piece-work tickets', () => {
      expect(rbacService.isModulePermitted('NODE_05_SEWING', 'stitching')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_05_SEWING', 'piece_work_tickets')).toBe(true);
      expect(rbacService.isModulePermitted('NODE_05_SEWING', 'financial_pnl')).toBe(false);
    });

    it('Accounts & HR Nodes 08 and 09 share identical combined access to billing and payroll', () => {
      for (const node of ['NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2']) {
        expect(rbacService.isModulePermitted(node, 'invoices')).toBe(true);
        expect(rbacService.isModulePermitted(node, 'payroll')).toBe(true);
        expect(rbacService.isModulePermitted(node, 'attendance')).toBe(true);
        expect(rbacService.isModulePermitted(node, 'cad_markers')).toBe(false);
      }
    });

    it('All 3 Admin Nodes (10, 11, 12) have full wildcard (*) access across any module', () => {
      for (const adminNode of ['NODE_10_ADMIN_MD', 'NODE_11_ADMIN_PARTNER', 'NODE_12_ADMIN_GM']) {
        expect(rbacService.isModulePermitted(adminNode, 'any_arbitrary_module')).toBe(true);
      }
    });
  });

  describe('TerminalNodeGuard Enforcement', () => {
    it('should allow operation when user terminal matches allowed nodes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['NODE_04_CUTTING']);
      const context = createMockContext({
        assignedNode: 'NODE_04_CUTTING',
        roleType: 'CUTTING_MASTER',
        isSuperAdmin: false,
      });

      expect(terminalGuard.canActivate(context)).toBe(true);
    });

    it('MULTI-OWNER RULE: Super Admin can operate on any terminal node', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['NODE_04_CUTTING']);
      const context = createMockContext({
        assignedNode: 'NODE_10_ADMIN_MD',
        roleType: 'MANAGING_DIRECTOR',
        isSuperAdmin: true,
      });

      expect(terminalGuard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when workstation node is unauthorized', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['NODE_08_ACCOUNTS_HR_1', 'NODE_09_ACCOUNTS_HR_2']);
      const context = createMockContext({
        assignedNode: 'NODE_05_SEWING',
        roleType: 'SEWING_SUPERVISOR',
        isSuperAdmin: false,
      });

      expect(() => terminalGuard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
