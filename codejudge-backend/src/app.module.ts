import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { IssueContextGatheringModule } from './issuecontextgathering/issueContextGatheringModule';

@Module({
  imports: [
    SharedModule,
    IssueContextGatheringModule,
  ],
})
export class AppModule {}
