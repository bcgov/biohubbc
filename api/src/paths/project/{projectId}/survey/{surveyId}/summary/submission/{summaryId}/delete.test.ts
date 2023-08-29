import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import { SummaryService } from '../../../../../../../../services/summary-service';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as delete_submission from './delete';

chai.use(sinonChai);

describe('deleteSummarySubmission', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 1,
      summaryId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_submission.deleteSummarySubmission();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_submission.deleteSummarySubmission();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no summaryId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_submission.deleteSummarySubmission();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, summaryId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `summaryId`');
    }
  });

  it('should return null when no rowCount', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      sql: mockQuery
    });

    sinon.stub(SummaryService.prototype, 'deleteSummarySubmission').resolves(null);

    const result = delete_submission.deleteSummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return rowCount on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      sql: mockQuery
    });

    sinon.stub(SummaryService.prototype, 'deleteSummarySubmission').resolves(1);

    const result = delete_submission.deleteSummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(1);
  });
});
