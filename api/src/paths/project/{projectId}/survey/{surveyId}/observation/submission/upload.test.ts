import chai from 'chai';
import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../../../database/db';
import { CustomError } from '../../../../../../../errors/CustomError';
import * as survey_occurrence_queries from '../../../../../../../queries/survey/survey-occurrence-queries';
import * as file_utils from '../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadObservationSubmission', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 2
    },
    body: {},
    files: [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ]
  } as any;

  let actualStatus = 0;

  const mockRes = {
    status: (status: number) => {
      actualStatus = status;
      return {
        send: () => {
          //do nothing
        }
      };
    }
  } as any;

  const mockNext = {} as any;

  it('should throw a 400 error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...mockReq, files: [] }, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      console.log(actualStatus);
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing upload data');
    }
  });

  it('should throw a 400 error when more than 1 file uploaded', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...mockReq, files: ['file1', 'file2'] }, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Too many files uploaded, expected 1');
    }
  });

  it('should throw a 400 error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...mockReq, params: { ...mockReq.params, projectId: null } }, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param: projectId');
    }
  });

  it('should throw a 400 error when surveyId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...mockReq, params: { ...mockReq.params, surveyId: null } }, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param: surveyId');
    }
  });

  it('should throw a 400 error when file contains malicious content', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    const result = upload.uploadMedia();

    try {
      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should throw a 400 error when it fails to insert a record in the database', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);

    const result = upload.uploadMedia();

    try {
      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to insert survey occurrence submission record');
    }
  });

  // it('should throw a 400 error when it fails to get the update SQL', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves(true);
  //   mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(null);

  //   const result = upload.uploadMedia();

  //   try {
  //     await result(mockReq, mockRes, mockNext);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal('Failed to build SQL update statement');
  //   }
  // });

  // it('should throw a 400 error when it fails to get the update the record in the database', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   //mockQuery.onCall(2).resolves(null);

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);

  //   const result = upload.uploadMedia();

  //   try {
  //     await result(mockReq, mockRes, mockNext);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal('Failed to update survey occurrence submission record');
  //   }
  // });

  // it('should throw a 400 error when it fails to insert a record in S3', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(2).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(file_utils, 'uploadFileToS3').rejects('Failed to insert occurrence submission data');

  //   const result = upload.uploadMedia();

  //   try {
  //     await result(mockReq, mockRes, mockNext);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).name).to.equal('Failed to insert occurrence submission data');
  //   }
  // });

  // it('should return 200 on success', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(2).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(survey_occurrence_queries, 'updateSurveyOccurrenceSubmissionSQL').returns(SQL`some query`);
  //   sinon.stub(file_utils, 'uploadFileToS3').resolves({ key: 'projects/1/surveys/1/test.txt' } as any);

  //   const result = upload.uploadMedia();

  //   await result(
  //     {
  //       ...mockReq,
  //       auth_payload: { preferred_username: 'user', email: 'example@email.com' }
  //     },
  //     mockRes,
  //     mockNext
  //   );
  //   expect(actualStatus).to.equal(200);
  // });

  // it('should throw a 400 error when it fails to get the insertSurveyOccurrenceSubmissionSQL SQL', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'insertSurveyOccurrenceSubmissionSQL').returns(null);

  //   const result = upload.uploadMedia();

  //   try {
  //     await result(mockReq, mockRes, mockNext);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal('Failed to build SQL insert statement');
  //   }
  // });

  // it('should throw a 400 error when it fails to get the getTemplateMethodologySpeciesId SQL', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
  //   sinon.stub(survey_occurrence_queries, 'getTemplateMethodologySpeciesRecordSQL').returns(null);

  //   const result = upload.uploadMedia();

  //   try {
  //     await result(mockReq, mockRes, mockNext);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal(
  //       'Failed to build SQL get template methodology species id sql statement'
  //     );
  //   }
  // });
});
