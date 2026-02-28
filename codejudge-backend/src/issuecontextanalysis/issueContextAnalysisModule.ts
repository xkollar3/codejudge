import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { IssueContextRepository } from './aggregate/IssueContextRepository';
import { ProvideIssueContextController } from './provideissuereference/provideIssueReference.controller';
import { ProvideIssueReferenceCommandHandler } from './provideissuereference/provideIssueReferenceCommand';

@Module({
  imports: [SharedModule],
  providers: [IssueContextRepository, ProvideIssueReferenceCommandHandler],
  controllers: [ProvideIssueContextController],
})
export class IssueContextModule {}
