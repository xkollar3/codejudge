import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type PullRequestDetails,
  type PullRequestDiffDetails,
  type VcsClient,
} from './vcsAcl';

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

  async getPullRequestDiffs(prUrl: string): Promise<PullRequestDiffDetails> {
    const { owner, repo, prNumber } = this.parsePrUrl(prUrl);

    const prInfo = await this.fetchPrInfo(owner, repo, prNumber);
    const files = await this.fetchPrFiles(owner, repo, prNumber);

    const changedFiles = await Promise.all(
      files.map(async (file) => {
        const fileBefore =
          file.status === 'added'
            ? null
            : await this.fetchFileContent(
                owner,
                repo,
                file.previous_filename ?? file.filename,
                prInfo.baseSha,
              );

        const fileAfter =
          file.status === 'removed'
            ? null
            : await this.fetchFileContent(
                owner,
                repo,
                file.filename,
                prInfo.headSha,
              );

        return {
          filename: file.filename,
          linesAdded: file.additions,
          linesRemoved: file.deletions,
          fileBefore,
          fileAfter,
        };
      }),
    );

    return {
      url: prUrl,
      baseSha: prInfo.baseSha,
      headSha: prInfo.headSha,
      changedFiles,
    };
  }

  private async fetchPrInfo(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<{ baseSha: string; headSha: string }> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub PR info: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as {
      base: { sha: string };
      head: { sha: string };
    };
    return { baseSha: data.base.sha, headSha: data.head.sha };
  }

  private async fetchPrFiles(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<
    Array<{
      filename: string;
      previous_filename?: string;
      status: string;
      additions: number;
      deletions: number;
    }>
  > {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/files`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub PR files: ${response.status} ${response.statusText}`,
      );
    }
    return (await response.json()) as Array<{
      filename: string;
      previous_filename?: string;
      status: string;
      additions: number;
      deletions: number;
    }>;
  }

  private async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string,
  ): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    this.logger.log(`GET ${url}`);

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch file content: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as { content: string; encoding: string };
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return data.content;
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
