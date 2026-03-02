import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type PullRequestDetails, type VcsClient } from './vcsAcl';

@Injectable()
export class GitHubVcsClient implements VcsClient {
  private readonly logger = new Logger(GitHubVcsClient.name);
  private readonly baseUrl = 'https://api.github.com';

  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.getOrThrow<string>('GITHUB_TOKEN');
  }

  async getPullRequestDetails(prUrl: string): Promise<PullRequestDetails> {
    const { owner, repo, prNumber } = this.parsePrUrl(prUrl);

    const [description, comments] = await Promise.all([
      this.fetchPrDescription(owner, repo, prNumber),
      this.fetchPrComments(owner, repo, prNumber),
    ]);

    return { url: prUrl, description, comments };
  }

  private parsePrUrl(url: string): {
    owner: string;
    repo: string;
    prNumber: number;
  } {
    const match = url.match(
      /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/,
    );
    if (!match) {
      throw new Error(`Invalid GitHub PR URL: ${url}`);
    }
    return {
      owner: match[1],
      repo: match[2],
      prNumber: parseInt(match[3], 10),
    };
  }

  private async fetchPrDescription(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub PR: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as { body: string | null };
    return data.body ?? '';
  }

  private async fetchPrComments(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<string[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub PR comments: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as Array<{ body: string }>;
    return data.map((comment) => comment.body);
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
    };
  }
}
