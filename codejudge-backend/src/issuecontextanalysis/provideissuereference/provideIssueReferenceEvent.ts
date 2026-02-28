import { Event, IEvent } from '@ocoda/event-sourcing';
import { type IssueTrackerType } from '../aggregate/IssueContext';

@Event('issue-reference-provided')
export class IssueReferenceProvidedEvent implements IEvent {
  constructor(
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}
