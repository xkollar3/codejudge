import {
  Aggregate,
  AggregateRoot,
  EventHandler,
  UUID,
} from '@ocoda/event-sourcing';
import {
  IssueReferenceProvidedEvent,
  IssueContextRetrievedEvent,
  PullRequestContextRetrievedEvent,
  PullRequestDiffsRetrievedEvent,
  type PullRequestContextPayload,
  type PullRequestDiffsPayload,
  type IssueTrackerType,
  type VcsType,
} from '../../events';

@Aggregate()
export class IssueContext extends AggregateRoot {
  public readonly id: UUID;
  private trackerType?: IssueTrackerType;
  private vcsType?: VcsType;
  private issueUrl?: string;

  private trackerIssueContext?: TrackerIssueContext;
  private pullRequestContexts?: PullRequestContext[];
  private pullRequestDiffs?: PullRequestDiffs[];

  constructor(id?: UUID) {
    super();
    this.id = id ?? UUID.generate();
  }

  public getVcsType(): VcsType {
    if (!this.vcsType) {
      throw new Error('Assertion failed: VCS type has not been set');
    }

    return this.vcsType;
  }

  public provideIssueReference(
    trackerType: IssueTrackerType,
    vcsType: VcsType,
    url: string,
  ) {
    this.applyEvent(new IssueReferenceProvidedEvent(trackerType, vcsType, url));
  }

  @EventHandler(IssueReferenceProvidedEvent)
  applyIssueReferenceProvided(event: IssueReferenceProvidedEvent) {
    this.trackerType = event.trackerType;
    this.vcsType = event.vcsType;
    this.issueUrl = event.issueUrl;
  }

  public retrieveIssueContext(
    title: string,
    description: string,
    pullRequests: string[],
  ) {
    this.applyEvent(
      new IssueContextRetrievedEvent(title, description, pullRequests),
    );
  }

  @EventHandler(IssueContextRetrievedEvent)
  applyIssueContextRetrieved(event: IssueContextRetrievedEvent) {
    this.trackerIssueContext = new TrackerIssueContext(
      event.title,
      event.description,
      event.pullRequests,
    );
  }

  public retrievePullRequestContext(details: PullRequestContextPayload[]) {
    this.applyEvent(new PullRequestContextRetrievedEvent(details));
  }

  @EventHandler(PullRequestContextRetrievedEvent)
  applyPullRequestContextRetrieved(event: PullRequestContextRetrievedEvent) {
    this.pullRequestContexts = event.pullRequestContexts.map(
      (ctx) => new PullRequestContext(ctx.url, ctx.description, ctx.comments),
    );
  }

  public retrievePullRequestDiffs(diffs: PullRequestDiffsPayload[]) {
    this.applyEvent(new PullRequestDiffsRetrievedEvent(diffs));
  }

  @EventHandler(PullRequestDiffsRetrievedEvent)
  applyPullRequestDiffsRetrieved(event: PullRequestDiffsRetrievedEvent) {
    this.pullRequestDiffs = event.pullRequestDiffs.map(
      (diff) =>
        new PullRequestDiffs(
          diff.url,
          diff.baseSha,
          diff.headSha,
          diff.changedFiles.map(
            (f) =>
              new ChangedFile(
                f.filename,
                f.linesAdded,
                f.linesRemoved,
                f.fileBefore,
                f.fileAfter,
              ),
          ),
        ),
    );
  }

}

export class TrackerIssueContext {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly pullRequests: string[],
  ) {}
}

export class PullRequestContext {
  constructor(
    public readonly url: string,
    public readonly description: string,
    public readonly comments: string[],
  ) {}
}

export class PullRequestDiffs {
  constructor(
    public readonly url: string,
    public readonly baseSha: string,
    public readonly headSha: string,
    public readonly changedFiles: ChangedFile[],
  ) {}
}

export class ChangedFile {
  constructor(
    public readonly filename: string,
    public readonly linesAdded: number,
    public readonly linesRemoved: number,
    public readonly fileBefore: string | null,
    public readonly fileAfter: string | null,
  ) {}
}
