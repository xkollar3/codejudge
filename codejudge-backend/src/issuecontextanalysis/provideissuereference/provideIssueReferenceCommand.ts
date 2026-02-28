import { ICommand, ICommandHandler } from '@ocoda/event-sourcing';
import { AggregateRepository } from '@ocoda/event-sourcing';
import { type IssueTrackerType } from '../aggregate/IssueContext';

export class ProvideIssueReferenceCommand implements ICommand {
  constructor(
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}

export class ProvideIssueReferenceCommandHandler implements ICommandHandler<ProvideIssueReferenceCommand> {
  constructor(
    private readonly aggregateRepository: Aggregate
  )
}
