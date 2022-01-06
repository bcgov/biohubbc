import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as listAttachments from './list';
import * as db from '../../../../../../database/db';
import survey_queries from '../../../../../../queries/survey';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import { HTTPError } from '../../../../../../errors/custom-error';

chai.use(sinonChai);

describe('lists the survey attachments', () => {
  const dbConnectionObj = getMockDBConnection();

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
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveyAttachmentsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(null);

    try {
      const result = listAttachments.getSurveyAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return a list of survey attachments where the lastModified is the create_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: 13,
            file_name: 'name1',
            create_date: '2020-01-01',
            update_date: '',
            file_size: 50,
            file_type: 'type',
            security_token: 'sometoken'
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            id: 14,
            file_name: 'name2',
            create_date: '2020-01-01',
            update_date: '',
            file_size: 50,
            file_type: 'type',
            security_token: 'sometoken'
          }
        ]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [
        {
          fileName: 'name1',
          fileType: 'type',
          securityToken: 'sometoken',
          id: 13,
          lastModified: '2020-01-01',
          size: 50
        },
        {
          fileName: 'name2',
          fileType: 'type',
          securityToken: 'sometoken',
          id: 14,
          lastModified: '2020-01-01',
          size: 50
        }
      ]
    });
  });

  it('should return a list of survey attachments where the lastModified is the update_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: 13,
            file_name: 'name1',
            create_date: '2020-01-01',
            update_date: '2020-04-04',
            file_size: 50,
            file_type: 'type',
            security_token: 'sometoken'
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            id: 14,
            file_name: 'name2',
            create_date: '2020-01-01',
            update_date: '2020-04-04',
            file_size: 50,
            file_type: 'type',
            security_token: 'sometoken'
          }
        ]
      });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [
        {
          fileName: 'name1',
          fileType: 'type',
          securityToken: 'sometoken',
          id: 13,
          lastModified: '2020-04-04',
          size: 50
        },
        {
          fileName: 'name2',
          fileType: 'type',
          securityToken: 'sometoken',
          id: 14,
          lastModified: '2020-04-04',
          size: 50
        }
      ]
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

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getSurveyAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
