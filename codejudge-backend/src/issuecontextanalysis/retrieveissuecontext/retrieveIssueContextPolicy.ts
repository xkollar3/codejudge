import { Logger } from '@nestjs/common';
import {
  IEventSubscriber,
  EventSubscriber,
  EventEnvelope,
  CommandBus,
  UUID,
} from '@ocoda/event-sourcing';
import { IssueReferenceProvidedEvent } from 'src/events';
import { RetrieveIssueContextCommand } from '../issuetracker/issueTrackerAcl';

@EventSubscriber(IssueReferenceProvidedEvent)
export class RetrieveIssueContextPolicy implements IEventSubscriber {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(envelope: EventEnvelope<IssueReferenceProvidedEvent>) {
    Logger.log('Handling issue reference provided event');
    const event = envelope.payload;
    const aggregateId = UUID.from(envelope.metadata.aggregateId);

    await this.commandBus.execute(
      new RetrieveIssueContextCommand(
        aggregateId,
        event.trackerType,
        event.issueUrl,
      ),
    );
  }
}
