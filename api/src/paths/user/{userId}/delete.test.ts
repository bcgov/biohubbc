import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import project_participation_queries from '../../../queries/project-participation';
import user_queries from '../../../queries/users';
import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as delete_endpoint from './delete';

chai.use(sinonChai);

describe('removeSystemUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing required path param: userId', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: userId');
    }
  });

  it('should throw a 400 error when no sql statement returned from `getParticipantsFromAllSystemUsersProjectsSQL`', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(project_participation_queries, 'getParticipantsFromAllSystemUsersProjectsSQL').returns(null);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error if the user is the only Project Lead role on one or more projects', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '33' };
    mockReq.body = { roles: [1, 2] };

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 2,
      rows: [
        {
          project_participation_id: 47,
          project_id: 3,
          system_user_id: 33,
          project_role_id: 1,
          project_role_name: 'Project Lead'
        },
        {
          project_participation_id: 57,
          project_id: 1,
          system_user_id: 33,
          project_role_id: 3,
          project_role_name: 'Viewer'
        },
        {
          project_participation_id: 40,
          project_id: 1,
          system_user_id: 27,
          project_role_id: 1,
          project_role_name: 'Project Lead'
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(project_participation_queries, 'getParticipantsFromAllSystemUsersProjectsSQL').returns(SQL`some query`);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot remove user. User is the only Project Lead for one or more projects.'
      );
    }
  });

  it('should throw a 400 error when it fails to get the system user', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves(null);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Failed to get system user');
      expect((actualError as HTTPError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when user record has expired', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '2010-10-10',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('The system user is not active');
    }
  });

  it('should throw a 400 error when no sql statement returned for `deleteAllProjectRolesSql`', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    sinon.stub(user_queries, 'deleteAllProjectRolesSQL').returns(null);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Failed to build SQL delete statement for deleting project roles'
      );
    }
  });

  it('should catch and re-throw an error if the database fails to delete all project roles', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    const expectedError = new Error('A database error');
    sinon.stub(delete_endpoint, 'deleteAllProjectRoles').rejects(expectedError);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(expectedError);
    }
  });

  it('should catch and re-throw an error if the database fails to delete all system roles', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    sinon.stub(delete_endpoint, 'deleteAllProjectRoles').resolves();

    const expectedError = new Error('A database error');
    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').rejects(expectedError);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(expectedError);
    }
  });

  it('should catch and re-throw an error if the database fails to deactivate the system user', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    sinon.stub(delete_endpoint, 'deleteAllProjectRoles').resolves();
    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();

    const expectedError = new Error('A database error');
    sinon.stub(UserService.prototype, 'deactivateSystemUser').rejects(expectedError);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(expectedError);
    }
  });

  it('should return 200 on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'testname',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    sinon.stub(delete_endpoint, 'deleteAllProjectRoles').resolves();
    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'deactivateSystemUser').resolves();

    const requestHandler = delete_endpoint.removeSystemUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });
});

describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
  describe('user has Project Lead role', () => {
    describe('user is on 1 project', () => {
      it('should return false if the user is not the only Project Lead role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return true if the user is the only Project Lead role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead' // Only Project Lead on project 1
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 2,
            project_role_name: 'Editor'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });

    describe('user is on multiple projects', () => {
      it('should return true if the user is not the only Project Lead on all projects', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return false if the user the only Project Lead on any project', () => {
        const userId = 10;

        // User is on 1 project, and is not the only Project Lead
        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Project Lead' // Only Project Lead on project 2
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Editor'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });
  });

  describe('user does not have Project Lead role', () => {
    describe('user is on 1 project', () => {
      it('should return true', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });
    });

    describe('user is on multiple projects', () => {
      it('should return true', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Editor'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Viewer'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Project Lead'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });
    });
  });

  describe('user is on no projects', () => {
    it('should return false', () => {
      const userId = 10;

      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 20,
          project_role_id: 1,
          project_role_name: 'Editor'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 30,
          project_role_id: 1,
          project_role_name: 'Project Lead'
        }
      ];

      const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

      expect(result).to.equal(true);
    });
  });
});

describe('doAllProjectsHaveAProjectLead', () => {
  it('should return false if no user has Project Lead role', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });

  it('should return true if one Project Lead role exists per project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 12,
        project_role_id: 1,
        project_role_name: 'Project Lead' // Only Project Lead on project 1
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return true if one Project Lead exists on all projects', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return false if no Project Lead exists on any one project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Project Lead'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Editor'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Editor'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });
});
