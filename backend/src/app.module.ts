import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { QualityModule } from './modules/quality/quality.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductionModule } from './modules/production/production.module';
import { LaborModule } from './modules/labor/labor.module';
import { HrmsModule } from './modules/hrms/hrms.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { BankingModule } from './modules/banking/banking.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuditModule,
    AuthModule,
    RbacModule,
    WorkflowModule,
    QualityModule,
    OrdersModule,
    ProductionModule,
    LaborModule,
    HrmsModule,
    PayrollModule,
    AccountsModule,
    BankingModule,
    SyncModule,
  ],
})
export class AppModule {}
