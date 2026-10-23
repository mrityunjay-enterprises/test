import { Injectable, Logger } from '@nestjs/common';
import {
  IBankingProvider,
  PayoutBatchRequest,
  PayoutBatchResponse,
  BatchReconciliationResult,
} from '../interfaces/banking-provider.interface';

@Injectable()
export class MockBankingProvider implements IBankingProvider {
  private readonly logger = new Logger(MockBankingProvider.name);

  // In-memory registry to verify idempotency and reconciliation in sandbox
  private processedBatches: Map<string, PayoutBatchResponse> = new Map();

  async submitBulkPayout(request: PayoutBatchRequest): Promise<PayoutBatchResponse> {
    this.logger.log(`[MOCK_BANK] Submitting batch ${request.batchNumber} with ${request.instructions.length} items`);

    // IDEMPOTENCY CHECK: If already submitted with same idempotency key, return prior response without re-executing transfers!
    if (this.processedBatches.has(request.idempotencyKey)) {
      this.logger.warn(`[MOCK_BANK] Idempotency duplicate intercepted for key: ${request.idempotencyKey}`);
      return this.processedBatches.get(request.idempotencyKey)!;
    }

    const providerBatchRef = `MOCK-CORP-REF-${Date.now()}`;

    const itemResults = request.instructions.map((item, idx) => {
      // Simulate realistic account validation
      const isInvalidIfsc = item.beneficiaryIfsc.startsWith('INVALID');
      if (isInvalidIfsc) {
        return {
          transactionId: item.transactionId,
          status: 'FAILED' as const,
          errorCode: 'INVALID_IFSC_CODE',
          errorMessage: `Bank IFSC code ${item.beneficiaryIfsc} is invalid or branch is defunct`,
        };
      }

      return {
        transactionId: item.transactionId,
        status: 'SUCCESS' as const,
        utrNumber: `UTR-MOCK-202610-${Date.now().toString().slice(-6)}${idx}`,
        bankReference: `TXN-REF-${item.transactionId.slice(0, 8)}`,
      };
    });

    const hasFailure = itemResults.some((r) => r.status === 'FAILED');
    const batchStatus = hasFailure ? 'PROCESSING' : 'SUCCESS';

    const response: PayoutBatchResponse = {
      providerBatchReference: providerBatchRef,
      status: batchStatus,
      itemResults,
      rawResponse: {
        gateway: 'MockCorporateHostToHost',
        mode: 'SANDBOX',
        processedAt: new Date().toISOString(),
        totalTransfers: request.instructions.length,
      },
    };

    this.processedBatches.set(request.idempotencyKey, response);
    return response;
  }

  async queryBatchStatus(providerBatchReference: string, idempotencyKey: string): Promise<BatchReconciliationResult> {
    this.logger.log(`[MOCK_BANK] Reconciling status for provider ref: ${providerBatchReference}`);

    const existing = this.processedBatches.get(idempotencyKey);
    if (!existing) {
      return {
        providerBatchReference,
        status: 'FAILED',
        itemResults: [],
      };
    }

    return {
      providerBatchReference,
      status: 'RECONCILED',
      itemResults: existing.itemResults,
    };
  }
}
