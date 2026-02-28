import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { IssueContextModule } from './issuecontextanalysis/issueContextAnalysisModule';

@Module({
  imports: [
    SharedModule,
    IssueContextModule,
  ],
})
export class AppModule {}
