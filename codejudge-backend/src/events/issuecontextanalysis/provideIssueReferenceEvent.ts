import { Event, IEvent } from '@ocoda/event-sourcing';

export type IssueTrackerType = 'GITHUB' | 'GITLAB' | 'JIRA';
export type VcsType = 'GITHUB' | 'GITLAB';

@Event('issue-reference-provided')
export class IssueReferenceProvidedEvent implements IEvent {
  constructor(
    public readonly trackerType: IssueTrackerType,
    public readonly vcsType: VcsType,
    public readonly issueUrl: string,
  ) {}
}
