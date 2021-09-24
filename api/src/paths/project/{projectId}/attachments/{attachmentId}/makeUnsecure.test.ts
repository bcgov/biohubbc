import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as makeUnsecure from './makeUnsecure';
import * as db from '../../../../../database/db';
import * as project_attachments_queries from '../../../../../queries/project/project-attachments-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('makeProjectAttachmentUnsecure', () => {
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
      attachmentId: 2
    },
    body: {
      securityToken: null
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
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `projectId`');
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
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw an error when request body is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when fails to build removeSecurityRecordSQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(project_attachments_queries, 'removeSecurityRecordSQL').returns(null);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { securityToken: 'token123' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL remove security record statement');
    }
  });

  it('should throw an error when fails to remove security record', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: null
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'removeSecurityRecordSQL').returns(SQL`something`);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { securityToken: 'token123' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to remove security record');
    }
  });

  it('should throw an error when fails to build SQL remove project attachment security token statement', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'removeSecurityRecordSQL').returns(SQL`something`);
    sinon.stub(project_attachments_queries, 'removeProjectAttachmentSecurityTokenSQL').returns(null);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { securityToken: 'token123' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL remove project attachment security token statement');
    }
  });

  it('should throw an error when fails to remove project attachment security token', async () => {
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

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'removeSecurityRecordSQL').returns(SQL`something`);
    sinon.stub(project_attachments_queries, 'removeProjectAttachmentSecurityTokenSQL').returns(SQL`something`);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, body: { securityToken: 'token123' } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to remove project attachment security token');
    }
  });

  it('should work on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rowCount: 1
      })
      .onSecondCall()
      .resolves({
        rowCount: 1
      });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'removeSecurityRecordSQL').returns(SQL`something`);
    sinon.stub(project_attachments_queries, 'removeProjectAttachmentSecurityTokenSQL').returns(SQL`something`);

    const result = makeUnsecure.makeProjectAttachmentUnsecure();

    await result({ ...sampleReq, body: { securityToken: 'token123' } }, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(1);
  });
});
