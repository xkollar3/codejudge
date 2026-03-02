import {
  Aggregate,
  AggregateRoot,
  EventHandler,
  UUID,
} from '@ocoda/event-sourcing';
import {
  IssueReferenceProvidedEvent,
  type IssueTrackerType,
} from '../../events';

@Aggregate()
export class IssueContext extends AggregateRoot {
  public readonly id: UUID;
  private trackerType?: IssueTrackerType;
  private issueUrl?: string;

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
}
