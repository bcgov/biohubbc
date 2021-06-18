import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as upload from './upload';
import * as db from '../../../../../../database/db';
import * as file_utils from '../../../../../../utils/file-utils';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

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

  it('should throw a 400 error when file format incorrect', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = upload.uploadMedia();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Upload was not successful');
    }
  });

  it('should return a list of file keys on success (with username and email)', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertSurveyAttachment').resolves(1);

    const result = upload.uploadMedia();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql(['1/1/test.txt']);
  });

  it('should return a list of file keys on success (without username and email)', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertSurveyAttachment').resolves(1);

    const result = upload.uploadMedia();

    await result(
      { ...sampleReq, auth_payload: { ...sampleReq.auth_payload, preferred_username: null, email: null } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.eql(['1/1/test.txt']);
  });
});
