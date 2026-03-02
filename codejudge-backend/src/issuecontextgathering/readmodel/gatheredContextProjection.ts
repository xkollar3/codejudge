import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventSubscriber,
  IEventSubscriber,
  EventEnvelope,
} from '@ocoda/event-sourcing';
import {
  IssueContextRetrievedEvent,
  PullRequestContextRetrievedEvent,
  PullRequestDiffsRetrievedEvent,
  type PullRequestDiffsPayload,
} from '../../events';
import { GatheredContext } from './gatheredContext.schema';

@EventSubscriber(IssueContextRetrievedEvent)
export class OnIssueContextRetrieved implements IEventSubscriber {
  constructor(
    @InjectModel(GatheredContext.name)
    private readonly model: Model<GatheredContext>,
  ) {}

  async handle(envelope: EventEnvelope<IssueContextRetrievedEvent>) {
    const event = envelope.payload;
    const aggregateId = envelope.metadata.aggregateId;

    await this.model.findOneAndUpdate(
      { aggregateId },
      {
        issue: { title: event.title, description: event.description },
      },
      { upsert: true },
    );
  }
}

@EventSubscriber(PullRequestContextRetrievedEvent)
export class OnPullRequestContextRetrieved implements IEventSubscriber {
  constructor(
    @InjectModel(GatheredContext.name)
    private readonly model: Model<GatheredContext>,
  ) {}

  async handle(envelope: EventEnvelope<PullRequestContextRetrievedEvent>) {
    const event = envelope.payload;
    const aggregateId = envelope.metadata.aggregateId;

    await this.model.findOneAndUpdate(
      { aggregateId },
      {
        pullRequests: event.pullRequestContexts.map((pr) => ({
          url: pr.url,
          description: pr.description,
          comments: pr.comments,
        })),
      },
      { upsert: true },
    );
  }
}

@EventSubscriber(PullRequestDiffsRetrievedEvent)
export class OnPullRequestDiffsRetrieved implements IEventSubscriber {
  constructor(
    @InjectModel(GatheredContext.name)
    private readonly model: Model<GatheredContext>,
  ) {}

  async handle(envelope: EventEnvelope<PullRequestDiffsRetrievedEvent>) {
    const event = envelope.payload;
    const aggregateId = envelope.metadata.aggregateId;

    const doc = await this.model.findOne({ aggregateId });
    if (!doc) return;

    const diffsByUrl = new Map<string, PullRequestDiffsPayload>(
      event.pullRequestDiffs.map((d) => [d.url, d]),
    );

    for (const pr of doc.pullRequests ?? []) {
      const diff = diffsByUrl.get(pr.url);
      if (diff) {
        pr.diffs = {
          baseSha: diff.baseSha,
          headSha: diff.headSha,
          changedFiles: diff.changedFiles.map((f) => ({
            filename: f.filename,
            linesAdded: f.linesAdded,
            linesRemoved: f.linesRemoved,
            fileBefore: f.fileBefore,
            fileAfter: f.fileAfter,
          })),
        };
      }
    }

    await doc.save();
  }
}
