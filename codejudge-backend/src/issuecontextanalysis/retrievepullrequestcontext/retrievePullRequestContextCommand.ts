import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';
import { VcsClientResolver } from '../vcs/vcsAcl';

export class RetrievePullRequestContextCommand implements ICommand {
  constructor(
    public readonly issueContextId: UUID,
    public readonly pullRequests: string[],
  ) {}
}

@CommandHandler(RetrievePullRequestContextCommand)
export class RetrievePullRequestContextCommandHandler
  implements ICommandHandler<RetrievePullRequestContextCommand>
{
  constructor(
    private readonly aggregateRepository: IssueContextRepository,
    private readonly vcsClientResolver: VcsClientResolver,
  ) {}

  async execute(command: RetrievePullRequestContextCommand): Promise<void> {
    const issueContext = await this.aggregateRepository.getById(
      command.issueContextId,
    );

    const client = this.vcsClientResolver.resolve(issueContext.getVcsType());
    const details = await Promise.all(
      command.pullRequests.map((prUrl) =>
        client.getPullRequestDetails(prUrl),
      ),
    );

    issueContext.retrievePullRequestContext(details);
    await this.aggregateRepository.save(issueContext);
  }
}
