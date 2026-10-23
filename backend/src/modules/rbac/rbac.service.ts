import { Injectable } from '@nestjs/common';

export interface WorkstationNodeDefinition {
  nodeCode: string;
  nodeName: string;
  department: string;
  portal: 'OWNER_PORTAL' | 'FACTORY_STATION';
  permittedModules: string[];
  restrictedModules: string[];
  isSuperAdmin: boolean;
}

@Injectable()
export class RbacService {
  private readonly nodes: Record<string, WorkstationNodeDefinition> = {
    NODE_01_MERCHANDISING: {
      nodeCode: 'NODE_01_MERCHANDISING',
      nodeName: 'Merchandising Office Terminal 1',
      department: 'Merchandising & Planning',
      portal: 'OWNER_PORTAL',
      permittedModules: ['orders', 'styles', 'sampling', 'customers', 'costing', 'reports'],
      restrictedModules: ['payroll', 'banking', 'system_users', 'sewing_output'],
      isSuperAdmin: false,
    },
    NODE_02_PPC_PLANNING: {
      nodeCode: 'NODE_02_PPC_PLANNING',
      nodeName: 'Planning Office Terminal 2',
      department: 'Merchandising & Planning',
      portal: 'OWNER_PORTAL',
      permittedModules: ['planning', 'orders', 'production_schedule', 'reports'],
      restrictedModules: ['commercial_margins', 'payroll', 'banking'],
      isSuperAdmin: false,
    },
    NODE_03_STORE: {
      nodeCode: 'NODE_03_STORE',
      nodeName: 'Store In-charge Godown Kiosk',
      department: 'Store (Raw Material Godown)',
      portal: 'FACTORY_STATION',
      permittedModules: ['inventory', 'fabric_grn', 'trims_stock', 'material_issue'],
      restrictedModules: ['commercial_pricing', 'payroll', 'tax_invoices', 'bank_accounts'],
      isSuperAdmin: false,
    },
    NODE_04_CUTTING: {
      nodeCode: 'NODE_04_CUTTING',
      nodeName: 'Cutting Master Desk',
      department: 'Cutting Floor',
      portal: 'FACTORY_STATION',
      permittedModules: ['cutting', 'lay_schedule', 'cut_order_reports', 'bundle_tickets'],
      restrictedModules: ['commercial_pricing', 'payroll', 'tax_invoices'],
      isSuperAdmin: false,
    },
    NODE_05_SEWING: {
      nodeCode: 'NODE_05_SEWING',
      nodeName: 'Sewing Floor Terminal',
      department: 'Production Sewing Lines',
      portal: 'FACTORY_STATION',
      permittedModules: ['stitching', 'hourly_output', 'bundle_scan', 'endline_checking', 'alteration_logs', 'piece_work_tickets'],
      restrictedModules: ['purchase_bills', 'customer_accounts', 'financial_pnl'],
      isSuperAdmin: false,
    },
    NODE_06_FINISHING: {
      nodeCode: 'NODE_06_FINISHING',
      nodeName: 'Finishing Area Terminal',
      department: 'Finishing & Washing',
      portal: 'FACTORY_STATION',
      permittedModules: ['finishing', 'bartack_button', 'thread_trimming', 'press_1', 'initial_qc', 'final_press', 'rework_logs'],
      restrictedModules: ['payroll', 'purchase_orders', 'financial_pnl'],
      isSuperAdmin: false,
    },
    NODE_07_PACKING_DISPATCH: {
      nodeCode: 'NODE_07_PACKING_DISPATCH',
      nodeName: 'Dispatch Dock Terminal',
      department: 'Packing & Dispatch',
      portal: 'FACTORY_STATION',
      permittedModules: ['packing', 'cartonization', 'barcode_printing', 'delivery_challan', 'gate_pass', 'dispatch'],
      restrictedModules: ['cutting_markers', 'payroll', 'system_settings'],
      isSuperAdmin: false,
    },
    NODE_08_ACCOUNTS_HR_1: {
      nodeCode: 'NODE_08_ACCOUNTS_HR_1',
      nodeName: 'Accounts & HR Terminal 1',
      department: 'Accounts & HR (Unified)',
      portal: 'OWNER_PORTAL',
      permittedModules: ['invoices', 'receivables', 'ledger', 'payroll', 'attendance', 'leave', 'reports'],
      restrictedModules: ['cad_markers', 'machine_maintenance', 'style_techpacks'],
      isSuperAdmin: false,
    },
    NODE_09_ACCOUNTS_HR_2: {
      nodeCode: 'NODE_09_ACCOUNTS_HR_2',
      nodeName: 'Accounts & HR Terminal 2',
      department: 'Accounts & HR (Unified)',
      portal: 'OWNER_PORTAL',
      permittedModules: ['invoices', 'receivables', 'ledger', 'payroll', 'attendance', 'leave', 'reports'],
      restrictedModules: ['cad_markers', 'machine_maintenance', 'style_techpacks'],
      isSuperAdmin: false,
    },
    // The 3 Admin Nodes have 100% Identical Full Super Admin Root Access
    NODE_10_ADMIN_MD: {
      nodeCode: 'NODE_10_ADMIN_MD',
      nodeName: 'Executive Cabin 1 (Managing Director)',
      department: 'Executive Administration',
      portal: 'OWNER_PORTAL',
      permittedModules: ['*'],
      restrictedModules: [],
      isSuperAdmin: true,
    },
    NODE_11_ADMIN_PARTNER: {
      nodeCode: 'NODE_11_ADMIN_PARTNER',
      nodeName: 'Executive Cabin 2 (Director / Partner)',
      department: 'Executive Administration',
      portal: 'OWNER_PORTAL',
      permittedModules: ['*'],
      restrictedModules: [],
      isSuperAdmin: true,
    },
    NODE_12_ADMIN_GM: {
      nodeCode: 'NODE_12_ADMIN_GM',
      nodeName: 'Executive Cabin 3 (General Manager)',
      department: 'Executive Administration',
      portal: 'OWNER_PORTAL',
      permittedModules: ['*'],
      restrictedModules: [],
      isSuperAdmin: true,
    },
  };

  getAllNodes(): WorkstationNodeDefinition[] {
    return Object.values(this.nodes);
  }

  getNode(nodeCode: string): WorkstationNodeDefinition | null {
    return this.nodes[nodeCode] || null;
  }

  isModulePermitted(nodeCode: string, moduleName: string): boolean {
    const node = this.nodes[nodeCode];
    if (!node) return false;
    if (node.isSuperAdmin || node.permittedModules.includes('*')) return true;
    return node.permittedModules.includes(moduleName);
  }
}
