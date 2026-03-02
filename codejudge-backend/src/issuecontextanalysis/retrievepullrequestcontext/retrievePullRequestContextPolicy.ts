import { Logger } from '@nestjs/common';
import {
  IEventSubscriber,
  EventSubscriber,
  EventEnvelope,
  CommandBus,
  UUID,
} from '@ocoda/event-sourcing';
import { IssueContextRetrievedEvent } from 'src/events';
import { RetrievePullRequestContextCommand } from '../vcs/vcsAcl';

@EventSubscriber(IssueContextRetrievedEvent)
export class RetrievePullRequestContextPolicy implements IEventSubscriber {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(envelope: EventEnvelope<IssueContextRetrievedEvent>) {
    Logger.log('Handling issue context retrieved event');
    const event = envelope.payload;
    const aggregateId = UUID.from(envelope.metadata.aggregateId);

    await this.commandBus.execute(
      new RetrievePullRequestContextCommand(
        aggregateId,
        event.pullRequests,
      ),
    );
  }
}
