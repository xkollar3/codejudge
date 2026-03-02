import { Event, IEvent } from '@ocoda/event-sourcing';

@Event('issue-context-retrieved')
export class IssueContextRetrievedEvent implements IEvent {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly pullRequests: string[],
  ) {}
}
