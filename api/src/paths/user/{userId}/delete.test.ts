import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as delete_system_user from './delete';
import * as db from '../../../database/db';
import * as user_queries from '../../../queries/users/user-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../__mocks__/db';
import { CustomError } from '../../../errors/CustomError';

chai.use(sinonChai);

describe('removeSystemUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      userId: 1
    },
    body: {
      roles: [1, 2]
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: (status: number) => {
      return {
        send: () => {
          actualResult = status;
        }
        // json: (status: any) => {
        //   actualResult = status;
        // }
      };
    }
  };

  it('should throw a 400 error when missing required path param: userId', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = delete_system_user.removeSystemUser();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, userId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param: userId');
    }
  });

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(null);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no result or rowCount on getting userResult', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [null] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to get system user');
    }
  });

  it('should throw a 400 error when user record has expired', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: '2020-10-10',
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('The system user is not active');
    }
  });

  it('should throw a 400 error when no sql statement returned for deleteAllProjectRolesSql', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(null);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal(
        'Failed to build SQL delete statement for deleting project roles'
      );
    }
  });

  it('should throw a 400 error when the query to delete project roles fails', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to the delete project roles');
    }
  });

  it('should throw a 400 error when there is not SQL statement returned for deleteAllSystemRolesSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });
    mockQuery.onCall(1).resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(null);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal(
        'Failed to build SQL delete statement for deleting system roles'
      );
    }
  });

  it('should throw a 400 error when delete system roles fails', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });
    mockQuery.onCall(1).resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to delete the user system roles');
    }
  });

  it('should throw a 400 error when there is no SQL for deActivateSystemUserSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });
    mockQuery.onCall(1).resolves({ rowCount: 1 });
    mockQuery.onCall(2).resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deActivateSystemUserSQL').returns(null);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal(
        'Failed to build SQL delete statement to deactivate system user'
      );
    }
  });

  it('should throw a 500 error when unable to delete a system user', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });
    mockQuery.onCall(1).resolves({ rowCount: 1 });
    mockQuery.onCall(2).resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deActivateSystemUserSQL').returns(SQL`some query`);

    try {
      const result = delete_system_user.removeSystemUser();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to remove user from the system');
    }
  });

  it('should return 200 on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rows: [
        {
          id: 1,
          user_identifier: 'testname',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['role 1', 'role 2']
        }
      ],
      rowCount: 1
    });
    mockQuery.onCall(1).resolves({ rowCount: 1 });
    mockQuery.onCall(2).resolves({ rowCount: 1 });
    mockQuery.onCall(3).resolves({ rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);
    sinon.stub(user_queries, 'deActivateSystemUserSQL').returns(SQL`some query`);

    const result = delete_system_user.removeSystemUser();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });
});
