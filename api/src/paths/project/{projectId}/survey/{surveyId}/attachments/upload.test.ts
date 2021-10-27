import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as upload from './upload';
import * as db from '../../../../../../database/db';
import * as file_utils from '../../../../../../utils/file-utils';
import * as survey_attachment_queries from '../../../../../../queries/survey/survey-attachments-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 1,
      attachmentId: 2
    },
    files: [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ],
    body: {
      attachmentType: 'Image'
    },
    auth_payload: {
      preferred_username: 'user',
      email: 'email@example.com'
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

  it('should throw an error when surveyId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing surveyId');
    }
  });

  it('should throw an error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...sampleReq, files: [] }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing upload data');
    }
  });

  it('should throw an error when attachmentType is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result(
        { ...sampleReq, body: { attachmentType: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing attachment file type');
    }
  });

  it('should throw a 400 error when file format incorrect', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);

    try {
      const result = upload.uploadMedia();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey attachment data');
    }
  });

  it('should throw a 400 error when file contains malicious content', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertSurveyAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadMedia();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should return id and revision_count on success (with username and email)', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertSurveyAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);

    const result = upload.uploadMedia();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({ attachmentId: 1, revision_count: 0 });
  });

  it('should return id and revision_count on success (without username and email)', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertSurveyAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);

    const result = upload.uploadMedia();

    await result(
      { ...sampleReq, auth_payload: { ...sampleReq.auth_payload, preferred_username: null, email: null } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.eql({ attachmentId: 1, revision_count: 0 });
  });
});

describe('upsertSurveyAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection({
    systemUserId: () => {
      return 20;
    }
  });

  const file = {
    fieldname: 'media',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 340
  } as any;

  const projectId = 1;
  const surveyId = 2;
  const attachmentType = 'Image';

  it('should throw an error when failed to generate SQL get statement', async () => {
    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(null);

    try {
      await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw an error when failed to generate SQL put statement', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rowCount: 1
    });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'putSurveyAttachmentSQL').returns(null);

    try {
      await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL update statement');
    }
  });

  it('should throw an error when failed to update survey attachment data', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rowCount: 1
      })
      .onSecondCall()
      .resolves({
        rowCount: null
      });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'putSurveyAttachmentSQL').returns(SQL`something`);

    try {
      await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to update survey attachment data');
    }
  });

  it('should return the id, revision_count of records updated on success (update)', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rowCount: 1
      })
      .onSecondCall()
      .resolves({
        rowCount: 1,
        rows: [{ id: 1, revision_count: 0 }]
      });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'putSurveyAttachmentSQL').returns(SQL`something`);

    const result = await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
      ...dbConnectionObj,
      query: mockQuery
    });

    expect(result).to.eql({ id: 1, revision_count: 0, key: 'projects/1/surveys/2/test.txt' });
  });

  it('should throw an error when failed to generate SQL insert statement', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rowCount: null
    });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'postSurveyAttachmentSQL').returns(null);

    try {
      await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw an error when insert result has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rowCount: null
      })
      .onSecondCall()
      .resolves({
        rows: []
      });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'postSurveyAttachmentSQL').returns(SQL`something`);

    try {
      await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert survey attachment data');
    }
  });

  it('should return the id and revision_count of record inserted on success (insert)', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rowCount: null
      })
      .onSecondCall()
      .resolves({
        rows: [{ id: 12, revision_count: 0, key: 'projects/1/surveys/2/test.txt' }]
      });

    sinon.stub(survey_attachment_queries, 'getSurveyAttachmentByFileNameSQL').returns(SQL`something`);
    sinon.stub(survey_attachment_queries, 'postSurveyAttachmentSQL').returns(SQL`something`);

    const result = await upload.upsertSurveyAttachment(file, projectId, surveyId, attachmentType, {
      ...dbConnectionObj,
      query: mockQuery
    });

    expect(result).to.eql({ id: 12, revision_count: 0, key: 'projects/1/surveys/2/test.txt' });
  });
});
