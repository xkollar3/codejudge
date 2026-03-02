import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { type IssueTrackerType } from '../../events';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';
import { IssueTrackerResolver } from '../issuetracker/issueTrackerAcl';

export class RetrieveIssueContextCommand implements ICommand {
  constructor(
    public readonly issueContextId: UUID,
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}

@CommandHandler(RetrieveIssueContextCommand)
export class RetrieveIssueContextCommandHandler
  implements ICommandHandler<RetrieveIssueContextCommand>
{
  constructor(
    private readonly aggregateRepository: IssueContextRepository,
    private readonly issueTrackerResolver: IssueTrackerResolver,
  ) {}

  async execute(command: RetrieveIssueContextCommand): Promise<void> {
    const tracker = this.issueTrackerResolver.resolve(command.trackerType);
    const details = await tracker.getIssueDetails(command.issueUrl);

    const issueContext = await this.aggregateRepository.getById(
      command.issueContextId,
    );
    issueContext.retrieveIssueContext(
      details.title,
      details.description,
      details.pullRequests,
    );
    await this.aggregateRepository.save(issueContext);
  }
}
