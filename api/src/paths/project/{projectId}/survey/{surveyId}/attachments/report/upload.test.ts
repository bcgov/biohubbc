import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as upload from './upload';
import * as db from '../../../../../../../database/db';
import * as file_utils from '../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import { HTTPError } from '../../../../../../../errors/custom-error';

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
      surveyId: 1
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
      attachmentType: 'Report'
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

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing projectId');
    }
  });

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
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing surveyId');
    }
  });

  it('should throw an error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...sampleReq, files: [] }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing upload data');
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
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert survey attachment data');
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
    sinon.stub(upload, 'upsertSurveyReportAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadMedia();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
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
    sinon.stub(upload, 'upsertSurveyReportAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
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
    sinon.stub(upload, 'upsertSurveyReportAttachment').resolves({ id: 1, revision_count: 0, key: '1/1/test.txt' });
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
