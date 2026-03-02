import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { IssueContextRepository } from './aggregate/IssueContextRepository';
import { GitHubIssueTracker } from './issuetracker/github';
import { RetrieveIssueContextCommandHandler } from './issuetracker/issueTrackerAcl';
import { ProvideIssueContextController } from './provideissuereference/provideIssueReference.controller';
import { ProvideIssueReferenceCommandHandler } from './provideissuereference/provideIssueReferenceCommand';
import { RetrieveIssueContextPolicy } from './retrieveissuecontext/retrieveIssueContextPolicy';
import { RetrievePullRequestContextPolicy } from './retrievepullrequestcontext/retrievePullRequestContextPolicy';
import { RetrievePullRequestContextCommandHandler } from './vcs/vcsAcl';
import { GitHubVcsClient } from './vcs/github';

@Module({
  imports: [SharedModule],
  providers: [
    IssueContextRepository,
    ProvideIssueReferenceCommandHandler,
    RetrieveIssueContextCommandHandler,
    RetrieveIssueContextPolicy,
    RetrievePullRequestContextPolicy,
    RetrievePullRequestContextCommandHandler,
    GitHubIssueTracker,
    GitHubVcsClient,
  ],
  controllers: [ProvideIssueContextController],
})
export class IssueContextModule {}
