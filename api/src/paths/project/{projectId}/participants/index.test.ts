import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { UserService } from '../../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as create_project_participants from './index';
import * as get_project_participants from './index';

chai.use(sinonChai);

describe('getParticipants', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = get_project_participants.getParticipants();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `projectId`');
    }
  });

  it('should catch and re-throw an error if ProjectService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipants').rejects(new Error('an error'));

    try {
      const requestHandler = get_project_participants.getParticipants();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return participants on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    sinon.stub(ProjectParticipationService.prototype, 'getProjectParticipants').resolves([
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

    const requestHandler = get_project_participants.getParticipants();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([
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
  });
});

describe('postProjectParticipants', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      participants: [['jsmith', SYSTEM_IDENTITY_SOURCE.IDIR, 1]]
    },
    params: {
      projectId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.postProjectParticipants();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `projectId`');
    }
  });

  it('should throw a 400 error when no participants in the request body', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_project_participants.postProjectParticipants();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, participants: [] } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `participants`');
    }
  });

  it('should catch and re-throw an error thrown by ensureSystemUserAndProjectParticipantUser', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: []
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(UserService.prototype, 'ensureSystemUser').rejects(new Error('an error'));

    try {
      const result = create_project_participants.postProjectParticipants();
      await result({ ...sampleReq }, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });
});
