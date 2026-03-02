import { Injectable } from '@nestjs/common';
import { type IssueTrackerType } from '../../events';
import { GitHubIssueTracker } from './github';

export type IssueDetails = {
  title: string;
  description: string;
  pullRequests: string[];
};

export interface IssueTracker {
  type(): IssueTrackerType;
  getIssueDetails(url: string): Promise<IssueDetails>;
}

@Injectable()
export class IssueTrackerResolver {
  constructor(private readonly githubIssueTracker: GitHubIssueTracker) {}

  resolve(trackerType: IssueTrackerType): IssueTracker {
    switch (trackerType) {
      case 'GITHUB':
        return this.githubIssueTracker;
      case 'JIRA':
        throw new Error('JIRA issue tracker is not implemented yet');
      case 'GITLAB':
        throw new Error('GitLab issue tracker is not implemented yet');
    }
  }
}
