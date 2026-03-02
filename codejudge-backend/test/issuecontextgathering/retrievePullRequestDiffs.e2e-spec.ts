import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventStore, EventStream, UUID } from '@ocoda/event-sourcing';
import { IssueContextGatheringModule } from 'src/issuecontextgathering/issueContextGatheringModule';
import { IssueContext } from 'src/issuecontextgathering/aggregate/IssueContext';
import { PullRequestDiffsRetrievedEvent } from 'src/events';
import { pollEvents } from '../utils/pollEvents';

describe('retrievePullRequestDiffs (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IssueContextGatheringModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('retrieves pull request diffs from GitHub and emits PullRequestDiffsRetrievedEvent', async () => {
    const response = await request(app.getHttpServer())
      .post('/issue-context')
      .send({
        trackerType: 'GITHUB',
        vcsType: 'GITHUB',
        issueUrl: 'https://github.com/xkollar3/codejudge/issues/1',
      })
      .expect(201);

    const aggregateId = UUID.from(response.body.id);
    const eventStore = app.get(EventStore);
    const stream = EventStream.for(IssueContext, aggregateId);

    const events = await pollEvents(eventStore, stream, 4, 20000);

    const diffsEvent = events.find(
      (e) => e instanceof PullRequestDiffsRetrievedEvent,
    );

    expect(diffsEvent).toBeDefined();
    expect(diffsEvent!.pullRequestDiffs).toHaveLength(1);

    const prDiff = diffsEvent!.pullRequestDiffs[0];
    expect(prDiff.url).toBe('https://github.com/xkollar3/codejudge/pull/2');
    expect(prDiff.baseSha).toBeDefined();
    expect(prDiff.headSha).toBeDefined();
    expect(prDiff.changedFiles).toHaveLength(1);

    const file = prDiff.changedFiles[0];
    expect(file.filename).toBe('README.md');
    expect(file.linesAdded).toBe(3);
    expect(file.linesRemoved).toBe(0);
    expect(file.fileBefore).toBeDefined();
    expect(file.fileAfter).toBeDefined();
    expect(file.fileAfter).toContain('VASTLY Improved this markdown!');
  }, 30000);
});
