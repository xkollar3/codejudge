import { Injectable } from '@nestjs/common';
import { IssueContext } from './IssueContext';
import { EventStore, EventStream, UUID } from '@ocoda/event-sourcing';

@Injectable()
export class IssueContextRepository {
  constructor(private readonly eventStore: EventStore) {}

  async getById(issueContextId: UUID): Promise<IssueContext> {
    const eventStream = EventStream.for<IssueContext>(
      IssueContext,
      issueContextId,
    );

    const issueContext = new IssueContext(issueContextId);

    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: issueContext.version + 1,
    });

    await issueContext.loadFromHistory(eventCursor);

    return issueContext;
  }

  async save(issueContext: IssueContext): Promise<void> {
    const events = issueContext.commit();
    const stream = EventStream.for<IssueContext>(IssueContext, issueContext.id);

    await this.eventStore.appendEvents(stream, issueContext.version, events);
  }
}
