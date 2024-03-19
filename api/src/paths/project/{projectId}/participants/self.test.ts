import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { getSelf } from './self';

chai.use(sinonChai);

describe('getSelf', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error if projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {};

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal("Missing required param 'projectId'");
    }
  });

  it('should throw an error if connection fails to get systemUserId', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => (null as unknown) as number
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal("Failed to get the user's system user ID");
    }
  });

  it('should return a null participant record', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves(null);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql(null);
  });

  it('should return a participant record with a single role', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 20,
        project_role_ids: [1],
        project_role_names: ['Test-Role-A'],
        project_role_permissions: ['Test Permission'],
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
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 20,
      project_role_ids: [1],
      project_role_names: ['Test-Role-A'],
      project_role_permissions: ['Test Permission'],
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
    });
  });

  it('should return a participant record with more than one role', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    const projectParticipationServiceStub = sinon
      .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
      .resolves({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 20,
        project_role_ids: [1, 2],
        project_role_names: ['Test-Role-A', 'Test-Role-B'],
        project_role_permissions: ['Test Permission'],
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
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(projectParticipationServiceStub).to.be.calledWith(1, 20);
    expect(mockRes.jsonValue).to.eql({
      project_participation_id: 1,
      project_id: 1,
      system_user_id: 20,
      project_role_ids: [1, 2],
      project_role_names: ['Test-Role-A', 'Test-Role-B'],
      project_role_permissions: ['Test Permission'],
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
    });
  });

  it('catches and re-throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => 20
    });

    sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipant').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
