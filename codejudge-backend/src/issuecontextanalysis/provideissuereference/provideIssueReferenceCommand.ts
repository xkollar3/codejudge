import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { IssueContext, type IssueTrackerType } from '../aggregate/IssueContext';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';

export class ProvideIssueReferenceCommand implements ICommand {
  constructor(
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}

@CommandHandler(ProvideIssueReferenceCommand)
export class ProvideIssueReferenceCommandHandler implements ICommandHandler<ProvideIssueReferenceCommand> {
  constructor(private readonly aggregateRepository: IssueContextRepository) {}

  async execute(command: ProvideIssueReferenceCommand): Promise<UUID> {
    const issueContext = new IssueContext();

    issueContext.provideIssueReference(command.trackerType, command.issueUrl);

    await this.aggregateRepository.save(issueContext);

    return issueContext.id;
  }
}
