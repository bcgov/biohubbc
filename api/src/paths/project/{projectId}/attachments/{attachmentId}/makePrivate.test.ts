import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as makePrivate from './makePrivate';
import * as db from '../../../../../database/db';
import * as project_attachments_queries from '../../../../../queries/project/project-attachments-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('makeProjectAttachmentPrivate', () => {
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
    }
  } as any;

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = makePrivate.makeProjectAttachmentPrivate();

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
      const result = makePrivate.makeProjectAttachmentPrivate();

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

  it('should throw an error when fails to build getProjectAttachmentSecurityRuleSQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(project_attachments_queries, 'getProjectAttachmentSecurityRuleSQL').returns(null);

    try {
      const result = makePrivate.makeProjectAttachmentPrivate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get project attachment security rule statement');
    }
  });

  it('should throw an error when fails to build addProjectAttachmentSecurityRuleSQL statement when no project attachment security rule id exists', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: null
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'getProjectAttachmentSecurityRuleSQL').returns(SQL`something`);
    sinon.stub(project_attachments_queries, 'addProjectAttachmentSecurityRuleSQL').returns(null);

    try {
      const result = makePrivate.makeProjectAttachmentPrivate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL insert project attachment security rule statement');
    }
  });

  it('should throw an error when fails to add project attachment security rule when no project attachment security rule id exists', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: null
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            id: null
          }
        ]
      });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });
    sinon.stub(project_attachments_queries, 'getProjectAttachmentSecurityRuleSQL').returns(SQL`something`);
    sinon.stub(project_attachments_queries, 'addProjectAttachmentSecurityRuleSQL').returns(SQL`something`);

    try {
      const result = makePrivate.makeProjectAttachmentPrivate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to insert project attachment security rule');
    }
  });
});
