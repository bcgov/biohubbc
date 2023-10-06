import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { ProjectParticipationRepository } from '../../../../repositories/project-participation-repository';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as delete_project_participant from './{projectParticipationId}';
import * as update_project_participant from './{projectParticipationId}';

chai.use(sinonChai);

describe('putProjectParticipantRole', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when delete fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectParticipationService.prototype, 'deleteProjectParticipationRecord').resolves();
    sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipants').resolves([
      {
        system_user_id: 1,
        project_id: 1,
        project_participation_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead').returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update_project_participant.putProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to update project participant role');
    }
  });

  it('should throw a 400 error when user is only coordinator', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectParticipationService.prototype, 'deleteProjectParticipationRecord').resolves({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 1,
      project_role_id: 1,
      create_date: '2023-01-01',
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 0
    });
    sinon.stub(ProjectParticipationService.prototype, 'postProjectParticipant').resolves();
    const getProjectParticipant = sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(1).returns(false);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = update_project_participant.putProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot update project user. User is the only Coordinator for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectParticipationService.prototype, 'deleteProjectParticipationRecord').resolves({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 1,
      project_role_id: 1,
      create_date: '2023-01-01',
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 0
    });
    sinon.stub(ProjectParticipationService.prototype, 'postProjectParticipant').resolves();
    const getProjectParticipant = sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(1).returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const requestHandler = update_project_participant.putProjectParticipantRole();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});

describe('deleteProjectParticipant', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 500 error when deleteProjectParticipationRecord fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord').resolves();
    sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants').resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead').returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project participant');
    }
  });

  it('should throw a 400 error when user is only coordinator', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord').resolves({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 1,
      project_role_id: 1,
      create_date: '2023-01-01',
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 0
    });
    const getProjectParticipant = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(0).returns(true); // all projects have a coordinator
    getProjectParticipant.onCall(1).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(1).returns(false); // not all projects have a coordinator

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete project user. User is the only Coordinator for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord').resolves({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 1,
      project_role_id: 1,
      create_date: '2023-01-01',
      create_user: 1,
      update_date: null,
      update_user: null,
      revision_count: 0
    });
    const getProjectParticipant = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(0).returns(true); // all projects have a coordinator
    getProjectParticipant.onCall(1).resolves([
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      }
    ]);
    doAllProjectsHaveLead.onCall(1).returns(true); // all projects have a coordinator

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const requestHandler = delete_project_participant.deleteProjectParticipant();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
