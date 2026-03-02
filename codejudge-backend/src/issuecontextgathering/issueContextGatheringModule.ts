import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { IssueContextRepository } from './aggregate/IssueContextRepository';
import { GitHubIssueTracker } from './issuetracker/github';
import { IssueTrackerResolver } from './issuetracker/issueTrackerAcl';
import { ProvideIssueContextController } from './provideissuereference/provideIssueReference.controller';
import { ProvideIssueReferenceCommandHandler } from './provideissuereference/provideIssueReferenceCommand';
import { RetrieveIssueContextCommandHandler } from './retrieveissuecontext/retrieveIssueContextCommand';
import { RetrieveIssueContextPolicy } from './retrieveissuecontext/retrieveIssueContextPolicy';
import { RetrievePullRequestContextPolicy } from './retrievepullrequestcontext/retrievePullRequestContextPolicy';
import { RetrievePullRequestContextCommandHandler } from './retrievepullrequestcontext/retrievePullRequestContextCommand';
import { RetrievePullRequestDiffsPolicy } from './retrievepullrequestdiffs/retrievePullRequestDiffsPolicy';
import { RetrievePullRequestDiffsCommandHandler } from './retrievepullrequestdiffs/retrievePullRequestDiffsCommand';
import { GatheredContextController } from './readmodel/gatheredContext.controller';
import { GatheredContext, GatheredContextSchema } from './readmodel/gatheredContext.schema';
import { OnIssueContextRetrieved, OnPullRequestContextRetrieved, OnPullRequestDiffsRetrieved } from './readmodel/gatheredContextProjection';
import { GitHubVcsClient } from './vcs/github';
import { VcsClientResolver } from './vcs/vcsAcl';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: GatheredContext.name, schema: GatheredContextSchema },
    ]),
  ],
  providers: [
    IssueContextRepository,
    ProvideIssueReferenceCommandHandler,
    RetrieveIssueContextCommandHandler,
    RetrieveIssueContextPolicy,
    RetrievePullRequestContextPolicy,
    RetrievePullRequestContextCommandHandler,
    RetrievePullRequestDiffsPolicy,
    RetrievePullRequestDiffsCommandHandler,
    GitHubIssueTracker,
    IssueTrackerResolver,
    GitHubVcsClient,
    VcsClientResolver,
    OnIssueContextRetrieved,
    OnPullRequestContextRetrieved,
    OnPullRequestDiffsRetrieved,
  ],
  controllers: [ProvideIssueContextController, GatheredContextController],
})
export class IssueContextGatheringModule {}
