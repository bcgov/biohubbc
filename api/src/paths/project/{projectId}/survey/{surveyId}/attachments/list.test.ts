import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as listAttachments from './list';
import * as db from '../../../../../../database/db';
import * as survey_attachments_queries from '../../../../../../queries/survey/survey-attachments-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('lists the survey attachments', () => {
  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1,
      surveyId: 1
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

  it('should throw a 400 error when no surveyId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = listAttachments.getSurveyAttachments();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveyAttachmentsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_attachments_queries, 'getSurveyAttachmentsSQL').returns(null);

    try {
      const result = listAttachments.getSurveyAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return a list of survey attachments where the lastModified is the create_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ id: 13, file_name: 'name1', create_date: '2020-01-01', update_date: '', file_size: 50 }]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachments_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [{ fileName: 'name1', id: 13, lastModified: '2020-01-01', size: 50 }]
    });
  });

  it('should return a list of survey attachments where the lastModified is the update_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ id: 13, file_name: 'name1', create_date: '2020-01-01', update_date: '2020-01-02', file_size: 50 }]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachments_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [{ fileName: 'name1', id: 13, lastModified: '2020-01-02', size: 50 }]
    });
  });

  it('should return null if the survey has no attachments, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachments_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
