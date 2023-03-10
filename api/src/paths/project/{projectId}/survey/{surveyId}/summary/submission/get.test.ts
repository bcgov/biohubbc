import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MESSAGE_CLASS_NAME } from '../../../../../../../constants/status';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { ISummarySubmissionMessagesResponse } from '../../../../../../../repositories/summary-repository';
import { SummaryService } from '../../../../../../../services/summary-service';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as summarySubmission from './get';

chai.use(sinonChai);

describe('getSummarySubmission', () => {
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
      const result = summarySubmission.getSurveySummarySubmission();
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

  it('should return a summary submission, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 13,
          file_name: 'file.xlsx',
          messages: []
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

    const messages: ISummarySubmissionMessagesResponse[] = [
      {
        id: 1,
        class: MESSAGE_CLASS_NAME.ERROR,
        type: 'Miscellaneous',
        message: 'error message'
      },
      {
        id: 2,
        class: MESSAGE_CLASS_NAME.ERROR,
        type: 'Miscellaneous',
        message: 'another error message'
      }
    ];

    const submission = {
      id: 13,
      file_name: 'file13.xlsx',
      key: 's3_key',
      uuid: 's3_uuid',
      delete_timestamp: null,
      submission_message_type_id: 1,
      message: 'another error message',
      submission_message_type_name: 'Miscellaneous',
      summary_submission_message_class_id: 1,
      submission_message_class_name: MESSAGE_CLASS_NAME.ERROR
    };

    sinon.stub(SummaryService.prototype, 'getLatestSurveySummarySubmission').resolves(submission);
    sinon.stub(SummaryService.prototype, 'getSummarySubmissionMessages').resolves(messages);

    const result = summarySubmission.getSurveySummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      fileName: 'file13.xlsx',
      messages
    });
  });

  it('should return null if the survey has no summary submission, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = summarySubmission.getSurveySummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
