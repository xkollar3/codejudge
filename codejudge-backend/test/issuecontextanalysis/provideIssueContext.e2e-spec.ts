import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { IssueContextModule } from 'src/issuecontextanalysis/issueContextAnalysisModule';
import { IssueTrackerType } from 'src/issuecontextanalysis/aggregate/IssueContext';

describe('provideIssueContext (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IssueContextModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Provide issue context returns 201 with new id', () => {
    const issueUrl = 'https://github.com/xkollar3/codejudge/issues/1';
    const trackerType: IssueTrackerType = 'GITHUB';

    return request(app.getHttpServer())
      .post('/issue-context')
      .send({ issueUrl, trackerType })
      .expect(200);
  });
});
