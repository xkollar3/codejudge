import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventStore, EventStream, UUID } from '@ocoda/event-sourcing';
import { IssueContextGatheringModule } from 'src/issuecontextgathering/issueContextGatheringModule';
import { IssueContext } from 'src/issuecontextgathering/aggregate/IssueContext';
import { PullRequestContextRetrievedEvent } from 'src/events';
import { pollEvents } from '../utils/pollEvents';

describe('retrievePullRequestContext (e2e)', () => {
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

  it('retrieves pull request context from GitHub and emits PullRequestContextRetrievedEvent', async () => {
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

    const events = await pollEvents(eventStore, stream, 3);

    const prEvent = events.find(
      (e) => e instanceof PullRequestContextRetrievedEvent,
    );

    expect(prEvent).toBeDefined();
    expect(prEvent!.pullRequestContexts).toHaveLength(1);
    expect(prEvent!.pullRequestContexts[0].url).toBe(
      'https://github.com/xkollar3/codejudge/pull/2',
    );
    expect(prEvent!.pullRequestContexts[0].description).toBe(
      'Added a section for developers to highlight improvements.',
    );
    expect(prEvent!.pullRequestContexts[0].comments).toContain(
      'Missing more detailed description of the project here.',
    );
  }, 15000);
});
