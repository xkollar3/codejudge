import { Logger } from '@nestjs/common';
import {
  IEventSubscriber,
  EventSubscriber,
  EventEnvelope,
  CommandBus,
  UUID,
} from '@ocoda/event-sourcing';
import { PullRequestContextRetrievedEvent } from 'src/events';
import { RetrievePullRequestDiffsCommand } from './retrievePullRequestDiffsCommand';

@EventSubscriber(PullRequestContextRetrievedEvent)
export class RetrievePullRequestDiffsPolicy implements IEventSubscriber {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(envelope: EventEnvelope<PullRequestContextRetrievedEvent>) {
    Logger.log('Handling pull request context retrieved event');
    const event = envelope.payload;
    const aggregateId = UUID.from(envelope.metadata.aggregateId);

    const pullRequestUrls = event.pullRequestContexts.map((ctx) => ctx.url);

    await this.commandBus.execute(
      new RetrievePullRequestDiffsCommand(aggregateId, pullRequestUrls),
    );
  }
}
