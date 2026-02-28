import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';
import { IssueReferenceProvidedEvent } from '../provideissuereference/provideIssueReferenceEvent';

export type IssueTrackerType = 'GITHUB' | 'GITLAB' | 'JIRA';

@Aggregate()
export class IssueContext extends AggregateRoot {
  private trackerType?: IssueTrackerType;
  private issueUrl?: string;

  public provideIssueReference(trackerType: IssueTrackerType, url: string) {
    this.applyEvent(new IssueReferenceProvidedEvent(trackerType, url));
  }

  @EventHandler(IssueReferenceProvidedEvent)
  applyIssueReferenceProvided(event: IssueReferenceProvidedEvent) {
    this.trackerType = event.trackerType;
    this.issueUrl = event.issueUrl;
  }
}
