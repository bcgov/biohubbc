import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as upload from './upload';
import * as db from '../../../../database/db';
import * as file_utils from '../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../__mocks__/db';
import { CustomError } from '../../../../errors/CustomError';
//import * as project_attachment_queries from '../../../../queries/project/project-attachments-queries';
//import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
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
      attachmentType: 'Other'
    }
  } as any;

  let actualResult: any = null;

  const mockRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  } as any;

  //const mockNext = {} as any;

  it('should throw an error when attachmentType is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result(
        { ...mockReq, body: { ...mockReq.body, attachmentType: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing attachment file type');
    }
  });

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result(
        { ...mockReq, params: { ...mockReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing projectId');
    }
  });

  it('should throw an error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadMedia();

      await result({ ...mockReq, files: [] }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing upload data');
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

      await result({ ...mockReq, files: ['file1'] }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
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
    sinon.stub(upload, 'upsertProjectAttachment').resolves({ id: 1, revision_count: 0, key: 'key' });
    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadMedia();

      await result(mockReq, mockRes as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should return id and revision_count on success (with username and email) when attachmentType is Other', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
    sinon.stub(upload, 'upsertProjectAttachment').resolves({ id: 1, revision_count: 0, key: 'key' });

    const result = upload.uploadMedia();

    await result(mockReq, mockRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({ attachmentId: 1, revision_count: 0 });
  });

  // it('should return 200 on success when attachmentType is Other', async () => {
  //   let actualStatus: any = null;

  //   const mockRes = {
  //     status: () => {
  //       return {
  //         json: (result: any) => {
  //           actualStatus = result;
  //         }
  //       };
  //     },
  //     send: (status: number) => {
  //       actualStatus = status;
  //     }
  //   } as any;

  //   const mockNext = {} as any;

  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({ rowCount: 1, rows: [{ id: 1 }] });
  //   mockQuery.onCall(1).resolves({ rowCount: 1, rows: [{ id: 1, revision_count: 1 }] });
  //   mockQuery.onCall(2).resolves({ rowCount: 1, rows: [{ id: 1 }] });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

    //sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    //sinon.stub(project_attachment_queries, 'getProjectAttachmentByFileNameSQL').returns(SQL`some query`);
    //sinon.stub(project_attachment_queries, 'postProjectAttachmentSQL').returns(SQL`some query`);

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

  //   console.log('actual status is:', actualStatus);
  //   expect(actualStatus).to.eql({ attachmentId: 1, revision_count: 1 });
  // });
});
