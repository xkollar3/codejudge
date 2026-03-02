import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  UUID,
} from '@ocoda/event-sourcing';
import { IssueContextRepository } from '../aggregate/IssueContextRepository';
import { VcsClientResolver } from '../vcs/vcsAcl';

export class RetrievePullRequestDiffsCommand implements ICommand {
  constructor(
    public readonly issueContextId: UUID,
    public readonly pullRequestUrls: string[],
  ) {}
}

@CommandHandler(RetrievePullRequestDiffsCommand)
export class RetrievePullRequestDiffsCommandHandler
  implements ICommandHandler<RetrievePullRequestDiffsCommand>
{
  constructor(
    private readonly aggregateRepository: IssueContextRepository,
    private readonly vcsClientResolver: VcsClientResolver,
  ) {}

  async execute(command: RetrievePullRequestDiffsCommand): Promise<void> {
    const issueContext = await this.aggregateRepository.getById(
      command.issueContextId,
    );

    const client = this.vcsClientResolver.resolve(issueContext.getVcsType());
    const diffs = await Promise.all(
      command.pullRequestUrls.map((prUrl) =>
        client.getPullRequestDiffs(prUrl),
      ),
    );

    issueContext.retrievePullRequestDiffs(diffs);
    await this.aggregateRepository.save(issueContext);
  }
}
