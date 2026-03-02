import { IssueContext, TrackerIssueContext } from './IssueContext';

describe('IssueContext', () => {
  it('sets tracker type and issue url when issue reference is provided', () => {
    const aggregate = new IssueContext();

    aggregate.provideIssueReference(
      'GITHUB',
      'https://github.com/xkollar3/codejudge/issues/1',
    );

    expect((aggregate as any).trackerType).toBe('GITHUB');
    expect((aggregate as any).issueUrl).toBe(
      'https://github.com/xkollar3/codejudge/issues/1',
    );
  });

  it('sets tracker issue context when issue context is retrieved', () => {
    const aggregate = new IssueContext();
    aggregate.provideIssueReference(
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
});
