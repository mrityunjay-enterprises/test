import { Module } from '@nestjs/common';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { AccountsModule } from '../accounts/accounts.module';
import { BANKING_PROVIDER_TOKEN } from './interfaces/banking-provider.interface';
import { MockBankingProvider } from './providers/mock-banking.provider';

@Module({
  imports: [AccountsModule],
  controllers: [BankingController],
  providers: [
    BankingService,
    {
      provide: BANKING_PROVIDER_TOKEN,
      useClass: MockBankingProvider,
    },
  ],
  exports: [BankingService],
})
export class BankingModule {}
