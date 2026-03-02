import { Event, IEvent } from '@ocoda/event-sourcing';

export type IssueTrackerType = 'GITHUB' | 'GITLAB' | 'JIRA';

@Event('issue-reference-provided')
export class IssueReferenceProvidedEvent implements IEvent {
  constructor(
    public readonly trackerType: IssueTrackerType,
    public readonly issueUrl: string,
  ) {}
}
