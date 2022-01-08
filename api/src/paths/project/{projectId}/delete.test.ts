import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import project_queries from '../../../queries/project';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as delete_project from './delete';
import * as file_utils from '../../../utils/file-utils';
import { HTTPError } from '../../../errors/custom-error';

chai.use(sinonChai);

describe('deleteProject', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1
    },
    system_user: { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] }
  } as any;

  let actualResult = {
    id: null
  };

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
      const result = delete_project.deleteProject();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'getProjectSQL').returns(null);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when fails to get the project cause no rows', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rows: [null]
        } as QueryResult<any>;
      }
    });

    sinon.stub(project_queries, 'getProjectSQL').returns(SQL`some`);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get the project');
    }
  });

  it('should throw a 400 error when fails to get the project cause no id', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rows: [
            {
              id: null
            }
          ]
        } as QueryResult<any>;
      }
    });

    sinon.stub(project_queries, 'getProjectSQL').returns(SQL`some`);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get the project');
    }
  });

  it('should throw a 400 error when user has insufficient role to delete', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rowCount: 1,
          rows: [
            {
              id: 1,
              publish_date: 'some date'
            }
          ]
        } as QueryResult<any>;
      }
    });

    try {
      const result = delete_project.deleteProject();

      await result(
        { ...sampleReq, system_user: { role_names: [SYSTEM_ROLE.PROJECT_CREATOR] } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete a published project if you are not a system administrator.'
      );
    }
  });

  it('should throw a 400 error when failed to get result for project attachments', async () => {
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get project attachments');
    }
  });

  it('should throw a 400 error when failed to build deleteProjectSQL statement', async () => {
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: [{ key: 'key' }] });

    // mock survey query
    mockQuery.onCall(2).resolves({ rows: [{ id: 1 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectSQL').returns(null);

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should return null when no delete result', async () => {
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: [{ key: 'key' }] });

    // mock survey query
    mockQuery.onCall(2).resolves({ rows: [{ id: 1 }] });

    // mock delete project query
    mockQuery.onCall(3).resolves();

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectSQL').returns(SQL`some`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves(null);

    const result = delete_project.deleteProject();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return true on successful delete', async () => {
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: [{ key: 'key' }] });

    // mock survey query
    mockQuery.onCall(2).resolves({ rows: [{ id: 1 }] });

    // mock delete project query
    mockQuery.onCall(3).resolves();

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);
    sinon.stub(project_queries, 'deleteProjectSQL').returns(SQL`some`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves({});

    const result = delete_project.deleteProject();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(true);
  });
});
