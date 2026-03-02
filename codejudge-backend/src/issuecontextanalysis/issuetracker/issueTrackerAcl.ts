import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { type IssueTrackerType } from '../../events';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';
import { GitHubIssueTracker } from './github';

export type IssueDetails = {
  title: string;
  description: string;
  pullRequests: string[];
};

export interface IssueTracker {
  type(): IssueTrackerType;
  getIssueDetails(url: string): Promise<IssueDetails>;
}

export class RetrieveIssueContextCommand implements ICommand {
  constructor(
    public readonly issueContextId: UUID,
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}

@CommandHandler(RetrieveIssueContextCommand)
export class RetrieveIssueContextCommandHandler implements ICommandHandler<RetrieveIssueContextCommand> {
  constructor(
    private readonly aggregateRepository: IssueContextRepository,
    private readonly githubIssueTracker: GitHubIssueTracker,
  ) {}

  async execute(command: RetrieveIssueContextCommand): Promise<void> {
    const tracker = this.resolveTracker(command.trackerType);
    const details = await tracker.getIssueDetails(command.issueUrl);

    const issueContext = await this.aggregateRepository.getById(command.issueContextId);
    issueContext.retrieveIssueContext(details.title, details.description, details.pullRequests);
    await this.aggregateRepository.save(issueContext);
  }

  private resolveTracker(trackerType: IssueTrackerType): IssueTracker {
    switch (trackerType) {
      case 'GITHUB':
        return this.githubIssueTracker;
      case 'JIRA':
        throw new Error('JIRA issue tracker is not implemented yet');
      case 'GITLAB':
        throw new Error('GitLab issue tracker is not implemented yet');
    }
  }
}
