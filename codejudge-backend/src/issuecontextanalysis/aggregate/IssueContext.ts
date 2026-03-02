import {
  Aggregate,
  AggregateRoot,
  EventHandler,
  UUID,
} from '@ocoda/event-sourcing';
import {
  IssueReferenceProvidedEvent,
  IssueContextRetrievedEvent,
  type IssueTrackerType,
} from '../../events';

@Aggregate()
export class IssueContext extends AggregateRoot {
  public readonly id: UUID;
  private trackerType?: IssueTrackerType;
  private issueUrl?: string;

  private trackerIssueContext?: TrackerIssueContext;

  constructor(id?: UUID) {
    super();
    this.id = id ?? UUID.generate();
  }

  public provideIssueReference(trackerType: IssueTrackerType, url: string) {
    this.applyEvent(new IssueReferenceProvidedEvent(trackerType, url));
  }

  @EventHandler(IssueReferenceProvidedEvent)
  applyIssueReferenceProvided(event: IssueReferenceProvidedEvent) {
    this.trackerType = event.trackerType;
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
}

export class TrackerIssueContext {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly pullRequests: string[],
  ) {}
}
