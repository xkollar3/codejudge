import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { IssueContextModule } from 'src/issuecontextanalysis/issueContextAnalysisModule';
import { IssueTrackerType } from 'src/events';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('provideIssueContext (e2e)', () => {
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

  it('Provide issue context returns 201 with new id', async () => {
    const issueUrl = 'https://github.com/xkollar3/codejudge/issues/1';
    const trackerType: IssueTrackerType = 'GITHUB';

    const response = await request(app.getHttpServer())
      .post('/issue-context')
      .send({ issueUrl, trackerType })
      .expect(201);

    expect(response.body.id).toMatch(UUID_REGEX);
  });

  it('returns 400 when required parameters are missing', async () => {
    await request(app.getHttpServer())
      .post('/issue-context')
      .send({})
      .expect(400);

    await request(app.getHttpServer())
      .post('/issue-context')
      .send({ issueUrl: 'https://github.com/xkollar3/codejudge/issues/1' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/issue-context')
      .send({ trackerType: 'GITHUB' })
      .expect(400);
  });
});
