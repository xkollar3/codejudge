import { Event, IEvent } from '@ocoda/event-sourcing';

export type PullRequestContextPayload = {
  url: string;
  description: string;
  comments: string[];
};

@Event('pull-request-context-retrieved')
export class PullRequestContextRetrievedEvent implements IEvent {
  constructor(
    public readonly pullRequestContexts: PullRequestContextPayload[],
  ) {}
}
