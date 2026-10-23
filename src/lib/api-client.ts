// ============================================================================
// GarmentFlow ERP — Full-Stack API Client & Hybrid Offline Gateway
// ============================================================================
// Provides strongly typed HTTP communication with the NestJS backend
// (/api/v1) with seamless fallback to offline local storage during factory LAN
// disconnects.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("garmentflow_auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${res.status}`,
        );
      }

      this.isOnline = true;
      return (await res.json()) as T;
    } catch (err: any) {
      if (err.name === "TypeError" && err.message?.includes("fetch")) {
        this.isOnline = false;
      }
      throw err;
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------------------------------
  async login(username: string, passwordHash: string) {
    return this.request<{
      access_token: string;
      user: {
        id: string;
        username: string;
        fullName: string;
        roleType: string;
        assignedNode: string;
        isSuperAdmin: boolean;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password: passwordHash }),
    });
  }

  async getMe() {
    return this.request<{
      userId: string;
      username: string;
      fullName: string;
      roleType: string;
      assignedNode: string;
      isSuperAdmin: boolean;
    }>("/auth/me");
  }

  // --------------------------------------------------------------------------
  // ORDERS & WORKFLOW (22 MILESTONES)
  // --------------------------------------------------------------------------
  async getOrders(params?: { status?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.request<any[]>(`/orders${query}`);
  }

  async getOrderById(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async getCustomers() {
    return this.request<any[]>("/orders/customers/list");
  }

  async createCustomer(customerData: any) {
    return this.request<any>("/orders/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async createOrder(orderData: any) {
    return this.request<any>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async advanceMilestone(orderId: string, targetMilestone: string, comments?: string) {
    return this.request<any>(`/workflow/orders/${orderId}/transition`, {
      method: "POST",
      body: JSON.stringify({ targetMilestone, comments }),
    });
  }

  // --------------------------------------------------------------------------
  // QUALITY GATES (FPT, GPT, SIZE SET)
  // --------------------------------------------------------------------------
  async approveFpt(orderId: string, labReportNo: string, remarks?: string) {
    return this.request<any>(`/quality/orders/${orderId}/fpt`, {
      method: "POST",
      body: JSON.stringify({ labReportNo, remarks }),
    });
  }

  async approveGpt(orderId: string, labReportNo: string, remarks?: string) {
    return this.request<any>(`/quality/orders/${orderId}/gpt`, {
      method: "POST",
      body: JSON.stringify({ labReportNo, remarks }),
    });
  }

  async approveSizeSet(orderId: string, samplePiecesApproved: number, remarks?: string) {
    return this.request<any>(`/quality/orders/${orderId}/size-set`, {
      method: "POST",
      body: JSON.stringify({ samplePiecesApproved, remarks }),
    });
  }

  // --------------------------------------------------------------------------
  // MANUFACTURING & SHOP FLOOR
  // --------------------------------------------------------------------------
  async generateCutReport(orderId: string, reportData: any) {
    return this.request<any>(`/production/orders/${orderId}/cut-report`, {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async logStitchingEndline(orderId: string, logData: any) {
    return this.request<any>(`/production/orders/${orderId}/stitching-endline`, {
      method: "POST",
      body: JSON.stringify(logData),
    });
  }

  async advanceFinishingStage(orderId: string, stageData: any) {
    return this.request<any>(`/production/orders/${orderId}/finishing-stage`, {
      method: "POST",
      body: JSON.stringify(stageData),
    });
  }

  // --------------------------------------------------------------------------
  // LABOR & HRMS
  // --------------------------------------------------------------------------
  async logPieceTicket(ticketData: any) {
    return this.request<any>("/labor/piece-tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });
  }

  async logHourlyWork(logData: any) {
    return this.request<any>("/labor/hourly-logs", {
      method: "POST",
      body: JSON.stringify(logData),
    });
  }

  async getEmployees() {
    return this.request<any[]>("/hrms/employees");
  }

  async recordAttendance(attendanceData: any) {
    return this.request<any>("/hrms/attendance", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    });
  }

  // --------------------------------------------------------------------------
  // DUAL-WAGE PAYROLL REGISTER
  // --------------------------------------------------------------------------
  async getPayrollPeriods() {
    return this.request<any[]>("/payroll/periods");
  }

  async calculatePayroll(periodId: string) {
    return this.request<any>(`/payroll/periods/${periodId}/calculate`, {
      method: "POST",
    });
  }

  async lockPayroll(periodId: string) {
    return this.request<any>(`/payroll/periods/${periodId}/lock`, {
      method: "POST",
    });
  }

  // --------------------------------------------------------------------------
  // BANKING PAYOUTS & DOUBLE-ENTRY LEDGER
  // --------------------------------------------------------------------------
  async createPayoutBatch(periodId: string, bankProvider?: string) {
    return this.request<any>("/banking/batches", {
      method: "POST",
      body: JSON.stringify({ periodId, bankProvider }),
    });
  }

  async approvePayoutBatch(batchId: string, comments?: string) {
    return this.request<any>(`/banking/batches/${batchId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    });
  }

  async submitPayoutBatch(batchId: string) {
    return this.request<any>(`/banking/batches/${batchId}/submit`, {
      method: "POST",
    });
  }

  async reconcilePayoutBatch(batchId: string) {
    return this.request<any>(`/banking/batches/${batchId}/reconcile`, {
      method: "POST",
    });
  }

  async getPayoutBatches() {
    return this.request<any[]>("/banking/batches");
  }

  async getLedgerEntries() {
    return this.request<any[]>("/accounts/ledger");
  }

  // --------------------------------------------------------------------------
  // SYNC ENGINE (FACTORY LAN <-> CLOUD PORTAL)
  // --------------------------------------------------------------------------
  async pullSyncEvents(clientNodeId: string, limit = 100) {
    return this.request<{
      clientNodeId: string;
      lastSyncedOutboxId: string;
      totalPending: number;
      events: any[];
    }>(`/sync/outbox/pending?clientNodeId=${clientNodeId}&limit=${limit}`);
  }

  async acknowledgeSync(clientNodeId: string, lastSyncedOutboxId: string) {
    return this.request<any>("/sync/outbox/acknowledge", {
      method: "POST",
      body: JSON.stringify({ clientNodeId, lastSyncedOutboxId }),
    });
  }

  async pushSyncBatch(clientNodeId: string, events: any[]) {
    return this.request<any>("/sync/inbox/apply", {
      method: "POST",
      body: JSON.stringify({ clientNodeId, events }),
    });
  }

  async getSyncConflicts() {
    return this.request<any[]>("/sync/conflicts");
  }

  async resolveSyncConflict(
    conflictId: string,
    resolution: "APPLY_CLOUD" | "APPLY_LOCAL" | "MANUAL_MERGE",
    mergedPayload?: any,
  ) {
    return this.request<any>(`/sync/conflicts/${conflictId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution, mergedPayload }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
