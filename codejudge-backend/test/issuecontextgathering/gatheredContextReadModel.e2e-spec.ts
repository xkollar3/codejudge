import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventStore, EventStream, UUID } from '@ocoda/event-sourcing';
import { IssueContextGatheringModule } from 'src/issuecontextgathering/issueContextGatheringModule';
import { IssueContext } from 'src/issuecontextgathering/aggregate/IssueContext';
import { pollEvents } from '../utils/pollEvents';

describe('gatheredContext read model (e2e)', () => {
  let app: INestApplication<App>;
  let eventStore: EventStore<any>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IssueContextGatheringModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    eventStore = app.get(EventStore);
  });

  afterEach(async () => {
    await app.close();
  });

  it('populates issue context after IssueContextRetrievedEvent', async () => {
    const response = await request(app.getHttpServer())
      .post('/issue-context')
      .send({
        trackerType: 'GITHUB',
        vcsType: 'GITHUB',
        issueUrl: 'https://github.com/xkollar3/codejudge/issues/1',
      })
      .expect(201);

    const id = response.body.id;
    const stream = EventStream.for(IssueContext, UUID.from(id));
    await pollEvents(eventStore, stream, 2);

    const { body } = await request(app.getHttpServer())
      .get(`/issue-context/${id}`)
      .expect(200);

    expect(body.aggregateId).toBe(id);
    expect(body.issue).toBeDefined();
    expect(body.issue.title).toBeDefined();
    expect(body.issue.description).toBeDefined();
  }, 15000);

  it('populates pull request contexts after PullRequestContextRetrievedEvent', async () => {
    const response = await request(app.getHttpServer())
      .post('/issue-context')
      .send({
        trackerType: 'GITHUB',
        vcsType: 'GITHUB',
        issueUrl: 'https://github.com/xkollar3/codejudge/issues/1',
      })
      .expect(201);

    const id = response.body.id;
    const stream = EventStream.for(IssueContext, UUID.from(id));
    await pollEvents(eventStore, stream, 3);

    const { body } = await request(app.getHttpServer())
      .get(`/issue-context/${id}`)
      .expect(200);

    expect(body.pullRequests).toHaveLength(1);
    expect(body.pullRequests[0].url).toBe(
      'https://github.com/xkollar3/codejudge/pull/2',
    );
    expect(body.pullRequests[0].description).toBe(
      'Added a section for developers to highlight improvements.',
    );
    expect(body.pullRequests[0].comments).toContain(
      'Missing more detailed description of the project here.',
    );
    expect(body.pullRequests[0].diffs?.baseSha).toBeUndefined();
  }, 15000);

  it('merges diffs into pull requests after PullRequestDiffsRetrievedEvent', async () => {
    const response = await request(app.getHttpServer())
      .post('/issue-context')
      .send({
        trackerType: 'GITHUB',
        vcsType: 'GITHUB',
        issueUrl: 'https://github.com/xkollar3/codejudge/issues/1',
      })
      .expect(201);

    const id = response.body.id;
    const stream = EventStream.for(IssueContext, UUID.from(id));
    await pollEvents(eventStore, stream, 4, 20000);

    const { body } = await request(app.getHttpServer())
      .get(`/issue-context/${id}`)
      .expect(200);

    expect(body.issue.title).toBeDefined();
    expect(body.pullRequests).toHaveLength(1);

    const pr = body.pullRequests[0];
    expect(pr.diffs).toBeDefined();
    expect(pr.diffs.baseSha).toBeDefined();
    expect(pr.diffs.headSha).toBeDefined();
    expect(pr.diffs.changedFiles).toHaveLength(1);

    const file = pr.diffs.changedFiles[0];
    expect(file.filename).toBe('README.md');
    expect(file.linesAdded).toBe(3);
    expect(file.linesRemoved).toBe(0);
    expect(file.fileBefore).toBeDefined();
    expect(file.fileAfter).toContain('VASTLY Improved this markdown!');
  }, 30000);
});
