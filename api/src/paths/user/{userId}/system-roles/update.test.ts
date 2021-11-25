import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as system_roles from './update';
import * as db from '../../../../database/db';
import * as user_queries from '../../../../queries/users/user-queries';
import * as system_role_queries from '../../../../queries/users/system-role-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../__mocks__/db';
import { CustomError } from '../../../../errors/CustomError';

chai.use(sinonChai);

describe('updateSystemRolesHandler', () => {
  afterEach(() => {
    sinon.restore();
  });
  beforeEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      userId: 1
    },
    body: {
      roles: [1]
    }
  } as any;

  let actualResult: number = (null as unknown) as number;

  const sampleRes = {
    status: (status: number) => {
      return {
        send: () => {
          actualResult = status;
        }
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
      const result = system_roles.updateSystemRolesHandler();

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

  it('should throw a 400 error when missing roles in request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = system_roles.updateSystemRolesHandler();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, roles: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required body param: roles');
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
      const result = system_roles.updateSystemRolesHandler();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no result or rowCount', async () => {
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
      const result = system_roles.updateSystemRolesHandler();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to get system user');
    }
  });

  it('should send a valid HTTP response on success (Filter out any system roles that have already been added to the user)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ id: 1, user_identifier: 'test name', role_ids: [1, 2], role_names: ['role 1', 'role 2'] }],
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

    const result = system_roles.updateSystemRolesHandler();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });

  it('should send a valid HTTP response on success (do not filter out any system roles that have already been added to the user)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] }],
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
    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

    const result = system_roles.updateSystemRolesHandler();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });

  it('should send a valid HTTP response on success (even when user does not have roles)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ id: 1, user_identifier: 'test name', role_ids: [], role_names: [] }],
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
    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

    const result = system_roles.updateSystemRolesHandler();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });

  // it('should throw a 400 when fails to build SQL insert statement ', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.resolves({
  //     rows: [{ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] }],
  //     rowCount: 1
  //   });

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
  //   sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(null);

  //   try {
  //     const result = system_roles.updateSystemRolesHandler();

  //     await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal('Failed to build SQL insert statement');
  //   }
  // });

  // it('should throw a 400 when fails to add system roles ', async () => {
  //   const mockQuery = sinon.stub();

  //   mockQuery.onCall(0).resolves({
  //     rows: [{ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] }],
  //     rowCount: 1
  //   });
  //   mockQuery.onCall(1).resolves(null);

  //   sinon.stub(db, 'getDBConnection').returns({
  //     ...dbConnectionObj,
  //     systemUserId: () => {
  //       return 20;
  //     },
  //     query: mockQuery
  //   });

  //   sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);
  //   sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

  //   try {
  //     const result = system_roles.updateSystemRolesHandler();

  //     await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
  //     expect.fail();
  //   } catch (actualError) {
  //     expect((actualError as CustomError).status).to.equal(400);
  //     expect((actualError as CustomError).message).to.equal('Failed to add system roles');
  //   }
  // });
});
