import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import project_queries from '../../../../../queries/project';
import survey_queries from '../../../../../queries/survey';
import { PlatformService } from '../../../../../services/platform-service';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as deleteFundingSource from './delete';

chai.use(sinonChai);

describe('delete a funding source', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1,
      pfsId: 1
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
      const result = deleteFundingSource.deleteFundingSource();
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

  it('should throw a 400 error when no pfsId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = deleteFundingSource.deleteFundingSource();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, pfsId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `pfsId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for deleteSurveyFundingSourceByProjectFundingSourceIdSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL').returns(null);
    sinon.stub(project_queries, 'deleteProjectFundingSourceSQL').returns(SQL`some`);

    try {
      const result = deleteFundingSource.deleteFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for deleteProjectFundingSourceSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'deleteProjectFundingSourceSQL').returns(null);

    try {
      const result = deleteFundingSource.deleteFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should return the row count of the removed funding source on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'deleteProjectFundingSourceSQL').returns(SQL`something`);

    sinon.stub(PlatformService.prototype, 'submitDwCAMetadataPackage').resolves();

    const result = deleteFundingSource.deleteFundingSource();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql(1);
  });

  it('throws a 400 error when delete survey fundingSource fails, because the response has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [], rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'deleteProjectFundingSourceSQL').returns(SQL`some query`);

    try {
      const result = deleteFundingSource.deleteFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project funding source');
    }
  });

  it('throws a 400 error when delete project fundingSource fails, because the response has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rows: [], rowCount: 1 }).onSecondCall().resolves({ rows: [], rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'deleteProjectFundingSourceSQL').returns(SQL`some query`);

    try {
      const result = deleteFundingSource.deleteFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project funding source');
    }
  });
});
