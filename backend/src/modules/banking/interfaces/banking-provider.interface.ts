import { Prisma } from '@prisma/client';

export interface PayoutInstruction {
  transactionId: string;
  beneficiaryAccountNo: string;
  beneficiaryIfsc: string;
  beneficiaryName: string;
  amount: Prisma.Decimal;
}

export interface PayoutBatchRequest {
  batchId: string;
  batchNumber: string;
  idempotencyKey: string;
  instructions: PayoutInstruction[];
}

export interface PayoutItemResult {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  utrNumber?: string;
  bankReference?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PayoutBatchResponse {
  providerBatchReference: string;
  status: 'SUBMITTED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  itemResults: PayoutItemResult[];
  rawResponse?: Record<string, any>;
}

export interface BatchReconciliationResult {
  providerBatchReference: string;
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RECONCILED';
  itemResults: PayoutItemResult[];
}

export interface IBankingProvider {
  submitBulkPayout(request: PayoutBatchRequest): Promise<PayoutBatchResponse>;
  queryBatchStatus(providerBatchReference: string, idempotencyKey: string): Promise<BatchReconciliationResult>;
}

export const BANKING_PROVIDER_TOKEN = 'IBankingProvider';
