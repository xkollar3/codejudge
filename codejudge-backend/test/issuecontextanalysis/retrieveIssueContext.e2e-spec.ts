import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventStore, EventStream, UUID } from '@ocoda/event-sourcing';
import { IssueContextModule } from 'src/issuecontextanalysis/issueContextAnalysisModule';
import { IssueContext } from 'src/issuecontextanalysis/aggregate/IssueContext';
import { IssueContextRetrievedEvent } from 'src/events';
import { pollEvents } from '../utils/pollEvents';

describe('retrieveIssueContext (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IssueContextModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('retrieves issue context from GitHub and emits IssueContextRetrievedEvent', async () => {
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

    const events = await pollEvents(eventStore, stream, 2);

    const retrievedEvent = events.find(
      (e) => e instanceof IssueContextRetrievedEvent,
    );

    expect(retrievedEvent).toBeDefined();
    expect(retrievedEvent!.title).toBeDefined();
    expect(retrievedEvent!.description).toBeDefined();
    expect(retrievedEvent!.pullRequests).toContain(
      'https://github.com/xkollar3/codejudge/pull/2',
    );
  }, 15000);
});
