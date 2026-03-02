import {
  IssueContext,
  TrackerIssueContext,
  PullRequestContext,
  PullRequestDiffs,
  ChangedFile,
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

  it('sets pull request diffs when pull request diffs are retrieved', () => {
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
        comments: ['Looks good'],
      },
    ]);

    aggregate.retrievePullRequestDiffs([
      {
        url: 'https://github.com/xkollar3/codejudge/pull/2',
        baseSha: 'abc123',
        headSha: 'def456',
        changedFiles: [
          {
            filename: 'src/app.ts',
            linesAdded: 10,
            linesRemoved: 3,
            fileBefore: 'const old = true;',
            fileAfter: 'const updated = true;',
          },
          {
            filename: 'src/new-file.ts',
            linesAdded: 5,
            linesRemoved: 0,
            fileBefore: null,
            fileAfter: 'export const newFile = true;',
          },
        ],
      },
    ]);

    const diffs = (aggregate as any).pullRequestDiffs as PullRequestDiffs[];
    expect(diffs).toHaveLength(1);
    expect(diffs[0].url).toBe(
      'https://github.com/xkollar3/codejudge/pull/2',
    );
    expect(diffs[0].baseSha).toBe('abc123');
    expect(diffs[0].headSha).toBe('def456');
    expect(diffs[0].changedFiles).toHaveLength(2);

    const file0 = diffs[0].changedFiles[0] as ChangedFile;
    expect(file0.filename).toBe('src/app.ts');
    expect(file0.linesAdded).toBe(10);
    expect(file0.linesRemoved).toBe(3);
    expect(file0.fileBefore).toBe('const old = true;');
    expect(file0.fileAfter).toBe('const updated = true;');

    const file1 = diffs[0].changedFiles[1] as ChangedFile;
    expect(file1.filename).toBe('src/new-file.ts');
    expect(file1.linesAdded).toBe(5);
    expect(file1.linesRemoved).toBe(0);
    expect(file1.fileBefore).toBeNull();
    expect(file1.fileAfter).toBe('export const newFile = true;');
  });

});
