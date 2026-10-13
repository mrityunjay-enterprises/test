// ============================================================================
// GarmentFlow ERP - Complete Type Definitions
// ============================================================================

// Organization Types
export interface Company {
  id: string;
  name: string;
  code: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  status: "active" | "inactive";
}

export interface Factory {
  id: string;
  companyId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  capacity: number;
  status: "active" | "inactive";
}

export interface Department {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  type: string;
  managerId?: string;
  status: "active" | "inactive";
}

export interface Warehouse {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  address: string;
  type: "raw-material" | "finished-goods" | "accessories" | "general";
  status: "active" | "inactive";
}

export interface ProductionLine {
  id: string;
  factoryId: string;
  departmentId: string;
  name: string;
  code: string;
  capacity: number;
  machineCount: number;
  supervisorId?: string;
  status: "active" | "inactive";
}

export interface Shift {
  id: string;
  factoryId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  graceMinutes: number;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  avatar?: string;
  designation: string;
  departmentId: string;
  department?: string;
  factoryId: string;
  factory?: string;
  reportingManagerId?: string;
  reportingManager?: string;
  roles: string[];
  permissions: string[];
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

export interface Permission {
  id: string;
  module: string;
  resource: string;
  action: string;
  description: string;
}

// Buyer & CRM Types
export interface Buyer {
  id: string;
  code: string;
  name: string;
  companyName: string;
  category: "domestic" | "export" | "both";
  type: "retail" | "wholesale" | "private-label" | "brand";
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  currency: string;
  paymentTerms: string;
  creditLimit: number;
  totalOrders: number;
  totalOrderValue: number;
  outstandingAmount: number;
  rating: number;
  status: "active" | "inactive" | "blocked";
  gstNumber?: string;
  panNumber?: string;
  createdAt: string;
}

export interface BuyerContact {
  id: string;
  buyerId: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  buyerId: string;
  buyerName: string;
  productCategory: string;
  styleReference: string;
  description: string;
  quantity: number;
  targetPrice: number;
  targetDate: string;
  merchandiserId: string;
  merchandiserName: string;
  probability: number;
  status: "new" | "under-discussion" | "sampling-requested" | "costing-submitted" | "negotiation" | "awaiting-approval" | "won" | "lost" | "on-hold";
  followUpDate: string;
  notes: string;
  createdAt: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  categories: string[];
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  paymentTerms: string;
  leadTime: number;
  rating: number;
  totalPurchases: number;
  outstandingAmount: number;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
}

export interface StyleAttachment {
  id: string;
  name: string;
  type: "image" | "pdf";
  url: string;
  size?: string;
  uploadedAt?: string;
}

export interface Style {
  id: string;
  styleNumber: string;
  styleName: string;
  buyerId: string;
  buyerName: string;
  brand: string;
  season: string;
  year: string;
  category: string;
  subcategory: string;
  gender: "men" | "women" | "kids" | "unisex";
  garmentType: string;
  description: string;
  mainImage?: string;
  attachments?: StyleAttachment[];
  fabricType: string;
  fabricComposition: string;
  fabricColor: string;
  gsm: number;
  smv: number;
  colors: StyleColor[];
  sizes: string[];
  status: "draft" | "active" | "archived";
  createdAt: string;
}

export interface StyleColor {
  id: string;
  name: string;
  code: string;
  hex?: string;
}

// Sample Types
export interface Sample {
  id: string;
  sampleNumber: string;
  buyerId: string;
  buyerName: string;
  styleId: string;
  styleName: string;
  type: "development" | "proto" | "fit" | "size-set" | "salesman" | "pre-production" | "production" | "shipment";
  quantity: number;
  requestedDate: string;
  requiredDate: string;
  merchandiserId: string;
  merchandiserName: string;
  tailorId?: string;
  tailorName?: string;
  revision: number;
  cost: number;
  status: "requested" | "material-pending" | "under-development" | "internal-review" | "sent-to-buyer" | "buyer-comments" | "revision-required" | "approved" | "rejected" | "closed";
  createdAt: string;
}

// BOM Types
export interface BOMItem {
  id: string;
  styleId: string;
  item: string;
  category: "main-fabric" | "lining" | "interlining" | "thread" | "button" | "zipper" | "elastic" | "label" | "tag" | "packaging" | "other";
  color: string;
  unit: string;
  consumptionPerGarment: number;
  wastagePercent: number;
  requiredQty: number;
  rate: number;
  estimatedCost: number;
  supplierId?: string;
  supplierName?: string;
  leadTime: number;
  remarks: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  buyerPO: string;
  buyerId: string;
  buyerName: string;
  brand: string;
  styleId: string;
  styleName: string;
  styleNumber: string;
  orderDate: string;
  confirmationDate: string;
  deliveryDate: string;
  shipmentDate: string;
  currency: string;
  paymentTerms: string;
  totalQuantity: number;
  unitPrice: number;
  totalValue: number;
  merchandiserId: string;
  merchandiserName: string;
  factoryId: string;
  factoryName: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: OrderStatus;
  cuttingQty: number;
  stitchingQty: number;
  finishingQty: number;
  packedQty: number;
  dispatchedQty: number;
  rejectedQty: number;
  estimatedCost: number;
  actualCost: number;
  profitMargin: number;
  createdAt: string;
}

export type OrderStatus = 
  | "draft" | "awaiting-approval" | "confirmed" | "material-planning" 
  | "material-procurement" | "ready-for-production" | "in-cutting" 
  | "in-stitching" | "in-special-process" | "in-finishing" 
  | "in-quality" | "in-packing" | "ready-for-dispatch" 
  | "dispatched" | "partially-dispatched" | "completed" | "on-hold" | "cancelled";

export interface OrderSizeBreakup {
  color: string;
  sizes: Record<string, number>;
  total: number;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  incomingStock: number;
  reorderLevel: number;
  minStock: number;
  maxStock: number;
  lastPrice: number;
  avgPrice: number;
  stockValue: number;
  lastReceiptDate: string;
  lastIssueDate: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "excess";
}

export interface FabricRoll {
  id: string;
  rollNumber: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  fabricType: string;
  composition: string;
  color: string;
  shade: string;
  lotNumber: string;
  width: number;
  gsm: number;
  receivedLength: number;
  acceptedLength: number;
  rejectedLength: number;
  warehouseId: string;
  warehouseName: string;
  location: string;
  inspectionStatus: "pending" | "inspected" | "accepted" | "rejected" | "conditional";
  allocatedOrderId?: string;
  status: "available" | "allocated" | "issued" | "consumed" | "returned";
}

export interface InventoryTransaction {
  id: string;
  transactionNumber: string;
  type: "receipt" | "issue" | "return" | "transfer" | "adjustment" | "scrap";
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  warehouseFrom?: string;
  warehouseTo?: string;
  orderId?: string;
  orderNumber?: string;
  referenceType: string;
  referenceId: string;
  userId: string;
  userName: string;
  remarks: string;
  createdAt: string;
}

// Purchase Types
export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  requestingDepartment: string;
  requestedBy: string;
  factoryId: string;
  factoryName: string;
  requiredDate: string;
  orderReference: string;
  styleReference: string;
  items: PurchaseRequisitionItem[];
  totalAmount: number;
  priority: "low" | "medium" | "high" | "urgent";
  approvalStatus: "draft" | "pending" | "approved" | "rejected" | "partial";
  createdAt: string;
}

export interface PurchaseRequisitionItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedRate: number;
  estimatedAmount: number;
  reason: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  deliveryLocation: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  freight: number;
  total: number;
  deliveryDate: string;
  paymentTerms: string;
  approvalStatus: "draft" | "pending" | "approved" | "rejected";
  deliveryStatus: "pending" | "partial" | "complete" | "overdue";
  receivedQty: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  receivedQty: number;
  unit: string;
  rate: number;
  discount: number;
  tax: number;
  amount: number;
}

// Production Types
export interface ProductionPlan {
  id: string;
  planNumber: string;
  orderId: string;
  orderNumber: string;
  styleId: string;
  styleName: string;
  factoryId: string;
  factoryName: string;
  lineId: string;
  lineName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedQty: number;
  actualQty: number;
  efficiency: number;
  status: "draft" | "approved" | "scheduled" | "in-progress" | "delayed" | "completed" | "on-hold" | "cancelled";
  createdAt: string;
}

export interface CuttingOrder {
  id: string;
  cuttingOrderNumber: string;
  orderId: string;
  orderNumber: string;
  styleId: string;
  styleName: string;
  color: string;
  plannedQty: number;
  cutQty: number;
  layCount: number;
  markerEfficiency: number;
  fabricIssued: number;
  fabricConsumed: number;
  fabricReturned: number;
  wastage: number;
  supervisorId: string;
  supervisorName: string;
  cuttingDate: string;
  status: "planned" | "fabric-issued" | "spreading" | "cutting" | "numbering" | "bundling" | "completed";
}

export interface Bundle {
  id: string;
  bundleNumber: string;
  cuttingOrderId: string;
  orderId: string;
  orderNumber: string;
  styleName: string;
  color: string;
  size: string;
  quantity: number;
  currentOperation: string;
  currentLine: string;
  status: "created" | "issued" | "in-stitching" | "in-process" | "in-finishing" | "in-qc" | "completed";
}

export interface ProductionEntry {
  id: string;
  lineId: string;
  lineName: string;
  operatorId: string;
  operatorName: string;
  orderId: string;
  orderNumber: string;
  bundleId: string;
  bundleNumber: string;
  operation: string;
  inputQty: number;
  outputQty: number;
  rejectedQty: number;
  reworkQty: number;
  shift: string;
  hour: number;
  date: string;
  createdAt: string;
}

// Quality Types
export interface QualityInspection {
  id: string;
  inspectionNumber: string;
  orderId: string;
  orderNumber: string;
  styleId: string;
  styleName: string;
  buyerName: string;
  stage: "incoming-material" | "fabric" | "cutting" | "inline-stitching" | "end-line" | "special-process" | "finishing" | "final" | "packing" | "pre-shipment";
  inspectorId: string;
  inspectorName: string;
  date: string;
  inspectedQty: number;
  passQty: number;
  failQty: number;
  reworkQty: number;
  rejectedQty: number;
  defects: QualityDefect[];
  decision: "pass" | "conditional-pass" | "rework" | "reject" | "hold";
  notes: string;
  images: string[];
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

export interface QualityDefect {
  id: string;
  category: string;
  description: string;
  severity: "minor" | "major" | "critical";
  location: string;
  quantity: number;
  rootCause?: string;
  correctiveAction?: string;
  images?: string[];
}

// Packing Types
export interface PackingList {
  id: string;
  packingNumber: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  styleName: string;
  cartons: PackingCarton[];
  totalCartons: number;
  totalQuantity: number;
  grossWeight: number;
  netWeight: number;
  status: "draft" | "in-progress" | "completed" | "approved";
  createdAt: string;
}

export interface PackingCarton {
  id: string;
  cartonNumber: string;
  color: string;
  sizeBreakup: Record<string, number>;
  quantity: number;
  grossWeight: number;
  netWeight: number;
  dimensions: string;
  barcode: string;
}

// Dispatch Types
export interface Dispatch {
  id: string;
  dispatchNumber: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  orderNumber: string;
  shipmentDate: string;
  dispatchDate: string;
  destination: string;
  transporter: string;
  vehicleNumber: string;
  lrNumber: string;
  cartons: number;
  quantity: number;
  grossWeight: number;
  netWeight: number;
  invoiceRef: string;
  ewayBill: string;
  status: "planned" | "approved" | "loading" | "dispatched" | "in-transit" | "delivered" | "pod-received";
  deliveryDate?: string;
  podImage?: string;
  createdAt: string;
}

// Invoice & Billing Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: "tax-invoice" | "commercial-export" | "proforma" | "credit-note";
  buyerId: string;
  buyerName: string;
  buyerGstin?: string;
  orderId?: string;
  orderNumber?: string;
  dispatchId?: string;
  dispatchNumber?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  hsnCode: string;
  paymentTerms: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankSwift?: string;
  status: "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled";
  createdBy: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  taxRate: number;
  total: number;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  buyerId: string;
  buyerName: string;
  paymentDate: string;
  paymentMode: "bank-transfer" | "wire-tt" | "lc" | "cheque" | "upi";
  referenceNumber: string;
  amount: number;
  currency: string;
  remarks: string;
  receivedBy: string;
}

// HRMS Types
export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  photo?: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  joiningDate: string;
  confirmationDate?: string;
  departmentId: string;
  department: string;
  designation: string;
  factoryId: string;
  factory: string;
  reportingManagerId?: string;
  reportingManager?: string;
  employmentType: "permanent" | "contract" | "trainee" | "apprentice" | "daily-wage" | "piece-rate" | "temporary" | "consultant";
  shift: string;
  grade: string;
  skillCategory: string;
  machineSkills: string[];
  basicSalary: number;
  grossSalary: number;
  bankName: string;
  bankAccount: string;
  ifscCode: string;
  panNumber: string;
  aadharNumber: string;
  pfNumber?: string;
  esiNumber?: string;
  status: "active" | "inactive" | "on-notice" | "terminated" | "absconding";
  exitDate?: string;
  exitReason?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  shift: string;
  inTime: string;
  outTime: string;
  workingHours: number;
  overtimeHours: number;
  status: "present" | "absent" | "half-day" | "late" | "early-exit" | "weekly-off" | "holiday" | "leave" | "on-duty" | "wfh";
  lateMinutes: number;
  earlyExitMinutes: number;
  remarks: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  halfDay: boolean;
  reason: string;
  attachmentUrl?: string;
  approverName: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  appliedDate: string;
  approvedDate?: string;
  remarks?: string;
}

export interface LeaveBalance {
  type: string;
  entitled: number;
  taken: number;
  balance: number;
  carryForward: number;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  month: string;
  year: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  overtimeHours: number;
  basicSalary: number;
  hra: number;
  conveyance: number;
  otherAllowances: number;
  incentives: number;
  overtimePay: number;
  bonus: number;
  grossPay: number;
  pfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  loanDeduction: number;
  advanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: "draft" | "calculated" | "approved" | "locked" | "paid";
}

// Job Work Types
export interface JobWorkOrder {
  id: string;
  jwOrderNumber: string;
  vendorId: string;
  vendorName: string;
  process: string;
  orderId: string;
  orderNumber: string;
  styleName: string;
  color: string;
  size: string;
  issuedQty: number;
  receivedQty: number;
  rejectedQty: number;
  shortQty: number;
  rate: number;
  totalAmount: number;
  expectedDate: string;
  actualReturnDate?: string;
  materialDetails: string;
  status: "created" | "material-issued" | "dispatched" | "in-progress" | "partial-received" | "completed" | "closed";
  createdAt: string;
}

// Approval Types
export interface ApprovalRequest {
  id: string;
  type: string;
  referenceType: string;
  referenceId: string;
  referenceNumber: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  amount?: number;
  currentLevel: number;
  totalLevels: number;
  status: "pending" | "approved" | "rejected" | "returned";
  actions: ApprovalAction[];
  createdAt: string;
}

export interface ApprovalAction {
  id: string;
  level: number;
  approverId: string;
  approverName: string;
  action: "approved" | "rejected" | "returned";
  comments: string;
  date: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete" | "approve" | "reject" | "export" | "login" | "logout" | "view";
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  device: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  changePositive?: boolean;
  suffix?: string;
  prefix?: string;
  icon?: string;
}

// Report Filter Types
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  companyId?: string;
  factoryId?: string;
  departmentId?: string;
  buyerId?: string;
  supplierId?: string;
  styleId?: string;
  orderId?: string;
  status?: string;
  category?: string;
}

// Settings Types
export interface NumberingSequence {
  id: string;
  entityType: string;
  prefix: string;
  currentNumber: number;
  format: string;
  yearBased: boolean;
  factoryBased: boolean;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string;
  editable: boolean;
}
