import { Event, IEvent } from '@ocoda/event-sourcing';

export type ChangedFilePayload = {
  filename: string;
  linesAdded: number;
  linesRemoved: number;
  fileBefore: string | null;
  fileAfter: string | null;
};

export type PullRequestDiffsPayload = {
  url: string;
  baseSha: string;
  headSha: string;
  changedFiles: ChangedFilePayload[];
};

@Event('pull-request-diffs-retrieved')
export class PullRequestDiffsRetrievedEvent implements IEvent {
  constructor(
    public readonly pullRequestDiffs: PullRequestDiffsPayload[],
  ) {}
}
