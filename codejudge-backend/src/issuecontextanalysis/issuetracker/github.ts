import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type IssueTrackerType } from '../../events';
import { type IssueDetails, type IssueTracker } from './issueTrackerAcl';

@Injectable()
export class GitHubIssueTracker implements IssueTracker {
  private readonly logger = new Logger(GitHubIssueTracker.name);
  private readonly baseUrl = 'https://api.github.com';
  private readonly graphqlUrl = 'https://api.github.com/graphql';

  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.getOrThrow<string>('GITHUB_TOKEN');
  }

  type(): IssueTrackerType {
    return 'GITHUB';
  }

  async getIssueDetails(url: string): Promise<IssueDetails> {
    const { owner, repo, issueNumber } = this.parseIssueUrl(url);

    const [issue, pullRequests] = await Promise.all([
      this.fetchIssue(owner, repo, issueNumber),
      this.fetchLinkedPullRequests(owner, repo, issueNumber),
    ]);

    return {
      title: issue.title,
      description: issue.body ?? '',
      pullRequests,
    };
  }

  private parseIssueUrl(url: string): {
    owner: string;
    repo: string;
    issueNumber: number;
  } {
    const match = url.match(
      /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/,
    );
    if (!match) {
      throw new Error(`Invalid GitHub issue URL: ${url}`);
    }
    return {
      owner: match[1],
      repo: match[2],
      issueNumber: parseInt(match[3], 10),
    };
  }

  private async fetchIssue(
    owner: string,
    repo: string,
    issueNumber: number,
  ): Promise<{ title: string; body: string | null }> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub issue: ${response.status} ${response.statusText}`,
      );
    }
    return response.json() as Promise<{ title: string; body: string | null }>;
  }

  private async fetchLinkedPullRequests(
    owner: string,
    repo: string,
    issueNumber: number,
  ): Promise<string[]> {
    const query = `{
      repository(owner: "${owner}", name: "${repo}") {
        issue(number: ${issueNumber}) {
          timelineItems(itemTypes: [CONNECTED_EVENT, CROSS_REFERENCED_EVENT], first: 100) {
            nodes {
              ... on ConnectedEvent {
                subject {
                  ... on PullRequest { url }
                }
              }
              ... on CrossReferencedEvent {
                source {
                  ... on PullRequest { url }
                }
              }
            }
          }
        }
      }
    }`;

    this.logger.log(`POST ${this.graphqlUrl} (linked PRs for ${owner}/${repo}#${issueNumber})`);

    const response = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch linked PRs: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as GraphQLResponse;
    const nodes = result.data?.repository?.issue?.timelineItems?.nodes ?? [];

    return nodes
      .map((node) => node.subject?.url ?? node.source?.url)
      .filter((url): url is string => url != null);
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
    };
  }
}

interface GraphQLResponse {
  data?: {
    repository?: {
      issue?: {
        timelineItems?: {
          nodes: Array<{
            subject?: { url: string };
            source?: { url: string };
          }>;
        };
      };
    };
  };
}
