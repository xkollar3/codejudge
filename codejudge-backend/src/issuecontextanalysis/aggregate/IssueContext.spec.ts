import {
  IssueContext,
  TrackerIssueContext,
  PullRequestContext,
} from './IssueContext';

describe('IssueContext', () => {
  it('sets tracker type, vcs type and issue url when issue reference is provided', () => {
    const aggregate = new IssueContext();

    aggregate.provideIssueReference(
      'GITHUB',
      'GITHUB',
      'https://github.com/xkollar3/codejudge/issues/1',
    );

    expect((aggregate as any).trackerType).toBe('GITHUB');
    expect((aggregate as any).vcsType).toBe('GITHUB');
    expect((aggregate as any).issueUrl).toBe(
      'https://github.com/xkollar3/codejudge/issues/1',
    );
  });

  it('sets tracker issue context when issue context is retrieved', () => {
    const aggregate = new IssueContext();
    aggregate.provideIssueReference(
      'GITHUB',
      'GITHUB',
      'https://github.com/xkollar3/codejudge/issues/1',
    );

    aggregate.retrieveIssueContext(
      'Issue title',
      'Issue description',
      ['https://github.com/xkollar3/codejudge/pull/2'],
    );

    const context = (aggregate as any).trackerIssueContext as TrackerIssueContext;
    expect(context.title).toBe('Issue title');
    expect(context.description).toBe('Issue description');
    expect(context.pullRequests).toEqual([
      'https://github.com/xkollar3/codejudge/pull/2',
    ]);
  });

  it('sets pull request contexts when pull request context is retrieved', () => {
    const aggregate = new IssueContext();
    aggregate.provideIssueReference(
      'GITHUB',
      'GITHUB',
      'https://github.com/xkollar3/codejudge/issues/1',
    );
    aggregate.retrieveIssueContext(
      'Issue title',
      'Issue description',
      ['https://github.com/xkollar3/codejudge/pull/2'],
    );

    aggregate.retrievePullRequestContext([
      {
        url: 'https://github.com/xkollar3/codejudge/pull/2',
        description: 'PR description',
        comments: ['Looks good', 'Please fix tests'],
      },
    ]);

    const contexts = (aggregate as any).pullRequestContexts as PullRequestContext[];
    expect(contexts).toHaveLength(1);
    expect(contexts[0].url).toBe(
      'https://github.com/xkollar3/codejudge/pull/2',
    );
    expect(contexts[0].description).toBe('PR description');
    expect(contexts[0].comments).toEqual(['Looks good', 'Please fix tests']);
  });
});
