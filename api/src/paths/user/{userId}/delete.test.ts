import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { ProjectParticipationService } from '../../../services/project-participation-service';
import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as delete_endpoint from './delete';

chai.use(sinonChai);

describe('removeSystemUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error if the user is the only Coordinator role on one or more projects', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    mockReq.params = { userId: '33' };
    mockReq.body = { roles: [1, 2] };

    const mockResponse = [
      {
        project_participation_id: 47,
        project_id: 3,
        system_user_id: 33,
        project_role_id: 1,
        project_role_name: 'Coordinator'
      },
      {
        project_participation_id: 57,
        project_id: 1,
        system_user_id: 33,
        project_role_id: 3,
        project_role_name: 'Observer'
      },
      {
        project_participation_id: 40,
        project_id: 1,
        system_user_id: 27,
        project_role_id: 1,
        project_role_name: 'Coordinator'
      }
    ];

    sinon
      .stub(ProjectParticipationService.prototype, 'getParticipantsFromAllProjectsBySystemUserId')
      .resolves(mockResponse);

    try {
      const requestHandler = delete_endpoint.removeSystemUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot remove user. User is the only Coordinator for one or more projects.'
      );
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
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: '2010-10-10',
      role_ids: [1, 2],
      role_names: ['System Admin', 'Coordinator'],
      email: 'email@email.com',
      display_name: 'test name',
      agency: null
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

  it('should catch and re-throw an error if the database fails to delete all project roles', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(delete_endpoint, 'checkIfUserIsOnlyProjectLeadOnAnyProject').resolves();

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['System Admin', 'Coordinator'],
      email: 'email@email.com',
      display_name: 'test name',
      agency: null
    });

    const expectedError = new Error('A database error');
    sinon.stub(UserService.prototype, 'deleteAllProjectRoles').rejects(expectedError);

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
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['System Admin', 'Coordinator'],
      email: 'email@email.com',
      display_name: 'test name',
      agency: null
    });

    sinon.stub(UserService.prototype, 'deleteAllProjectRoles').resolves();

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
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['System Admin', 'Coordinator'],
      email: 'email@email.com',
      display_name: 'test name',
      agency: null
    });

    sinon.stub(UserService.prototype, 'deleteAllProjectRoles').resolves();
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
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['System Admin', 'Coordinator'],
      email: 'email@email.com',
      display_name: 'test name',
      agency: null
    });

    sinon.stub(UserService.prototype, 'deleteAllProjectRoles').resolves();
    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'deactivateSystemUser').resolves();

    const requestHandler = delete_endpoint.removeSystemUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });
});

describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
  describe('user has Coordinator role', () => {
    describe('user is on 1 project', () => {
      it('should return false if the user is not the only Coordinator role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return true if the user is the only Coordinator role', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Coordinator' // Only Coordinator on project 1
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 2,
            project_role_name: 'Collaborator'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });

    describe('user is on multiple projects', () => {
      it('should return true if the user is not the only Coordinator on all projects', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });

      it('should return false if the user the only Coordinator on any project', () => {
        const userId = 10;

        // User is on 1 project, and is not the only Coordinator
        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Collaborator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Coordinator' // Only Coordinator on project 2
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Collaborator'
          }
        ];

        const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(false);
      });
    });
  });

  describe('user does not have Coordinator role', () => {
    describe('user is on 1 project', () => {
      it('should return true', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Collaborator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Coordinator'
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
            project_role_name: 'Collaborator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          },
          {
            project_participation_id: 1,
            project_id: 2,
            system_user_id: userId,
            project_role_id: 1,
            project_role_name: 'Observer'
          },
          {
            project_participation_id: 2,
            project_id: 2,
            system_user_id: 2,
            project_role_id: 1,
            project_role_name: 'Coordinator'
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
          project_role_name: 'Collaborator'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 30,
          project_role_id: 1,
          project_role_name: 'Coordinator'
        }
      ];

      const result = delete_endpoint.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

      expect(result).to.equal(true);
    });
  });
});

describe('doAllProjectsHaveAProjectLead', () => {
  it('should return false if no user has Coordinator role', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });

  it('should return true if one Coordinator role exists per project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 12,
        project_role_id: 1,
        project_role_name: 'Coordinator' // Only Coordinator on project 1
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return true if one Coordinator exists on all projects', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Coordinator'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Coordinator'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 2,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(true);
  });

  it('should return false if no Coordinator exists on any one project', () => {
    const rows = [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 10,
        project_role_id: 1,
        project_role_name: 'Coordinator'
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      },
      {
        project_participation_id: 1,
        project_id: 2,
        system_user_id: 10,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      },
      {
        project_participation_id: 2,
        project_id: 2,
        system_user_id: 20,
        project_role_id: 2,
        project_role_name: 'Collaborator'
      }
    ];

    const result = delete_endpoint.doAllProjectsHaveAProjectLead(rows);

    expect(result).to.equal(false);
  });
});
