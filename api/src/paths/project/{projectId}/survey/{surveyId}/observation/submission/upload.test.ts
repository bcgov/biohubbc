import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/custom-error';
import survey_queries from '../../../../../../../queries/survey';
import * as file_utils from '../../../../../../../utils/file-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadObservationSubmission', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when files are missing', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [];

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = upload.uploadMedia();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing upload data');
    }
  });

  it('should throw a 400 error when more than 1 file uploaded', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'file1'
      },
      {
        fieldname: 'file2'
      }
    ] as any;

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = upload.uploadMedia();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Too many files uploaded, expected 1');
    }
  });

  it('should throw a 400 error when projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = upload.uploadMedia();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: projectId');
    }
  });

  it('should throw a 400 error when surveyId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: ''
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = upload.uploadMedia();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: surveyId');
    }
  });

  it('should throw a 400 error when file contains malicious content', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should throw a 400 error when it fails to insert a record in the database', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert survey occurrence submission record');
    }
  });

  it('should throw a 400 error when it fails to get the update SQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(survey_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(null);

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw a 400 error when it fails to get the update the record in the database', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
    mockQuery.onCall(1).resolves(null);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(survey_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to update survey occurrence submission record');
    }
  });

  it('should throw a 400 error when it fails to insert a record in S3', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
    mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(survey_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'uploadFileToS3').rejects('Failed to insert occurrence submission data');

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).name).to.equal('Failed to insert occurrence submission data');
    }
  });

  it('should return 200 on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;
    mockReq['auth_payload'] = {
      preferred_username: 'user',
      email: 'example@email.com'
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
    mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });
    mockQuery.onCall(2).resolves({ rowCount: 1, rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(survey_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'uploadFileToS3').resolves({ key: 'projects/1/surveys/1/test.txt' } as any);

    const requestHandler = upload.uploadMedia();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });

  it('should throw a 400 error when it fails to get the insertSurveyOccurrenceSubmissionSQL SQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };
    mockReq.files = [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ] as any;

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(null);

    const requestHandler = upload.uploadMedia();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
    }
  });
});
