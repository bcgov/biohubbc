import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as makeUnsecure from './makeUnsecure';
import * as db from '../../../../../database/db';
import security_queries from '../../../../../queries/security';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';

chai.use(sinonChai);

describe('makeProjectAttachmentUnsecure', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    body: {
      securityToken: 'sometoken',
      attachmentType: 'Image'
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
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

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

  it('should throw an error when attachmentId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, attachmentId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw an error when request body is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when attachmentType is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { attachmentType: null, securityToken: 'sometoken' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when securityToken is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { attachmentType: 'Image', securityToken: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when fails to build unsecureRecordSQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(null);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL unsecure record statement');
    }
  });

  it('should throw an error when fails to unsecure record', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: null
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to unsecure record');
    }
  });

  it('should work on success when type is not Report', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    const result = makeUnsecure.makeProjectAttachmentUnsecure();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(1);
  });

  it('should work on success when type is Report', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    const result = makeUnsecure.makeProjectAttachmentUnsecure();

    await result(
      { ...sampleReq, body: { ...sampleReq.body, attachmentType: 'Report' } },
      sampleRes as any,
      (null as unknown) as any
    );

    expect(actualResult).to.equal(1);
  });
});
