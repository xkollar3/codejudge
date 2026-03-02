import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { type VcsType } from '../../events';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';
import { GitHubVcsClient } from './github';

export type PullRequestDetails = {
  url: string;
  description: string;
  comments: string[];
};

export interface VcsClient {
  getPullRequestDetails(prUrl: string): Promise<PullRequestDetails>;
}

export class RetrievePullRequestContextCommand implements ICommand {
  constructor(
    public readonly issueContextId: UUID,
    public readonly pullRequests: string[],
  ) {}
}

@CommandHandler(RetrievePullRequestContextCommand)
export class RetrievePullRequestContextCommandHandler
  implements ICommandHandler<RetrievePullRequestContextCommand>
{
  constructor(
    private readonly aggregateRepository: IssueContextRepository,
    private readonly githubVcsClient: GitHubVcsClient,
  ) {}

  async execute(command: RetrievePullRequestContextCommand): Promise<void> {
    const issueContext = await this.aggregateRepository.getById(
      command.issueContextId,
    );

    const client = this.resolveClient(issueContext.getVcsType());
    const details = await Promise.all(
      command.pullRequests.map((prUrl) =>
        client.getPullRequestDetails(prUrl),
      ),
    );

    issueContext.retrievePullRequestContext(details);
    await this.aggregateRepository.save(issueContext);
  }

  private resolveClient(vcsType: VcsType): VcsClient {
    switch (vcsType) {
      case 'GITHUB':
        return this.githubVcsClient;
      case 'GITLAB':
        throw new Error('GitLab VCS client is not implemented yet');
      default:
        throw new Error(`Unknown VCS type: ${vcsType}`);
    }
  }
}
