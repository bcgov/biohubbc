import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as delete_project from './delete';
import * as db from '../../../database/db';
import * as project_attachments_queries from '../../../queries/project/project-attachments-queries';
import * as survey_view_queries from '../../../queries/survey/survey-view-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('deleteProject', () => {
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
      projectId: 1
    }
  } as any;

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_project.deleteProject();

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

  it('should throw a 400 error when no sql statement returned for getProjectAttachmentSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_attachments_queries, 'getProjectAttachmentsSQL').returns(null);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveyIdsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_attachments_queries, 'getProjectAttachmentsSQL').returns(SQL`some nice query`);
    sinon.stub(survey_view_queries, 'getSurveyIdsSQL').returns(null);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when failed to get result for project attachments', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_attachments_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);
    sinon.stub(survey_view_queries, 'getSurveyIdsSQL').returns(SQL`something`);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to get project attachments');
    }
  });

  it('should throw a 400 error when failed to get result for survey ids', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({ rows: [] }).onSecondCall().resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_attachments_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);
    sinon.stub(survey_view_queries, 'getSurveyIdsSQL').returns(SQL`something`);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to get survey ids associated to project');
    }
  });
});
