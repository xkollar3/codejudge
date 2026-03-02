import { Injectable } from '@nestjs/common';
import { type VcsType } from '../../events';
import { GitHubVcsClient } from './github';

export type PullRequestDetails = {
  url: string;
  description: string;
  comments: string[];
};

export type PullRequestDiffDetails = {
  url: string;
  baseSha: string;
  headSha: string;
  changedFiles: {
    filename: string;
    linesAdded: number;
    linesRemoved: number;
    fileBefore: string | null;
    fileAfter: string | null;
  }[];
};

export interface VcsClient {
  getPullRequestDetails(prUrl: string): Promise<PullRequestDetails>;
  getPullRequestDiffs(prUrl: string): Promise<PullRequestDiffDetails>;
}

@Injectable()
export class VcsClientResolver {
  constructor(private readonly githubVcsClient: GitHubVcsClient) {}

  resolve(vcsType: VcsType): VcsClient {
    switch (vcsType) {
      case 'GITHUB':
        return this.githubVcsClient;
      case 'GITLAB':
        throw new Error('GitLab VCS client is not implemented yet');
      default:
        throw new Error(`Unknown VCS type: ${vcsType}`);
    }
  }
}
