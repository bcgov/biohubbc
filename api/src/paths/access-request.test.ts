import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import * as db from '../database/db';
import { HTTPError } from '../errors/custom-error';
import { IgcNotifyPostReturn } from '../models/gcnotify';
import { UserObject } from '../models/user';
import * as administrative_activity from '../paths/administrative-activity';
import { queries } from '../queries/queries';
import { GCNotifyService } from '../services/gcnotify-service';
import { KeycloakService, KeycloakUser } from '../services/keycloak-service';
import { UserService } from '../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as access_request from './access-request';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const sampleReq = {
    keycloak_token: {},
    body: {
      userIdentifier: 'username',
      identitySource: 'identitySource',
      requestId: 1,
      requestStatusTypeId: 1
    }
  } as any;

  it('should throw a 400 error when no user identifier body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, userIdentifier: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
    }
  });

  it('should throw a 400 error when no identity source body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, identitySource: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: identitySource');
    }
  });

  it('should throw a 400 error when no request id body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, requestId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: requestId');
    }
  });

  it('should throw a 400 error when no request status type id body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, requestStatusTypeId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: requestStatusTypeId');
    }
  });

  it('re-throws any error that is thrown', async () => {
    const mockDBConnection = getMockDBConnection({
      open: () => {
        throw new Error('test error');
      }
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      userIdentifier: 1,
      identitySource: 'identitySource',
      requestId: 1,
      requestStatusTypeId: 1,
      roleIds: [1, 3]
    };

    const requestHandler = access_request.updateAccessRequest();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('test error');
    }
  });

  it('adds new system roles and updates administrative activity', async () => {
    const mockDBConnection = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestId = 1;
    const requestStatusTypeId = 2;
    const roleIdsToAdd = [1, 3];

    mockReq.body = {
      userIdentifier: 'username',
      identitySource: 'identitySource',
      requestId: requestId,
      requestStatusTypeId: requestStatusTypeId,
      roleIds: roleIdsToAdd
    };

    const systemUserId = 4;
    const existingRoleIds = [1, 2];
    const mockSystemUser: UserObject = {
      id: systemUserId,
      user_identifier: '',
      record_end_date: '',
      role_ids: existingRoleIds,
      role_names: []
    };
    const ensureSystemUserStub = sinon.stub(UserService.prototype, 'ensureSystemUser').resolves(mockSystemUser);

    const addSystemRolesStub = sinon.stub(UserService.prototype, 'addUserSystemRoles');

    const updateAdministrativeActivityStub = sinon.stub(administrative_activity, 'updateAdministrativeActivity');

    const requestHandler = access_request.updateAccessRequest();

    await requestHandler(mockReq, mockRes, mockNext);

    const expectedRoleIdsToAdd = [3];

    expect(ensureSystemUserStub).to.have.been.calledOnce;
    expect(addSystemRolesStub).to.have.been.calledWith(systemUserId, expectedRoleIdsToAdd);
    expect(updateAdministrativeActivityStub).to.have.been.calledWith(requestId, requestStatusTypeId);
  });

  it('checks If Access request if approval is false', async () => {
    const mockResponseRow = { name: 'Rejected' };
    const mockQueryResponse = ({ rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

    const mockgetAdminActTypeSQLResponse = SQL`Test SQL Statement`;
    const queriesStub = sinon
      .stub(queries.administrativeActivity, 'getAdministrativeActivityById')
      .resolves(mockgetAdminActTypeSQLResponse);

    const functionResponse = await access_request.checkIfAccessRequestIsApproval(1, mockDBConnection);

    expect(functionResponse).to.equal(false);
    expect(queriesStub).to.be.calledOnce;
  });

  it('checks If Access request if approval is true', async () => {
    const mockResponseRow = { name: 'Actioned' };
    const mockQueryResponse = ({ rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

    const mockgetAdminActTypeSQLResponse = SQL`Test SQL Statement`;
    const queriesStub = sinon
      .stub(queries.administrativeActivity, 'getAdministrativeActivityById')
      .resolves(mockgetAdminActTypeSQLResponse);

    const functionResponse = await access_request.checkIfAccessRequestIsApproval(2, mockDBConnection);

    expect(functionResponse).to.equal(true);
    expect(queriesStub).to.be.calledOnce;
  });

  it('attempts to send approval email', async () => {
    const mockResponseRow = { name: 'Actioned' };
    const mockQueryResponse = ({ rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

    const mockgetAdminActTypeSQLResponse = SQL`Test SQL Statement`;
    const queriesStub = sinon
      .stub(queries.administrativeActivity, 'getAdministrativeActivityById')
      .resolves(mockgetAdminActTypeSQLResponse);

    const keycloakUserReturnObject = {
      id: '0',
      username: '1',
      firstName: '2',
      lastName: '3',
      enabled: false,
      email: '123@PinpointEmail.com',
      attributes: {
        idir_user_guid: [''],
        idir_userid: [''],
        idir_guid: [''],
        displayName: ['']
      }
    } as KeycloakUser;

    const GCNotifyPostReturnObject = {
      content: {},
      id: 'string',
      reference: 'string',
      scheduled_for: 'string',
      template: {},
      uri: 'string'
    } as IgcNotifyPostReturn;

    const getUserByUsernameStub = sinon
      .stub(KeycloakService.prototype, 'getUserByUsername')
      .resolves(keycloakUserReturnObject);

    const sendEmailGCNotificationStub = sinon
      .stub(GCNotifyService.prototype, 'sendEmailGCNotification')
      .resolves(GCNotifyPostReturnObject);

    await access_request.sendApprovalEmail(2, mockDBConnection, 'name', SYSTEM_IDENTITY_SOURCE.IDIR);

    expect(queriesStub).to.be.calledOnce;
    expect(getUserByUsernameStub).to.be.calledOnce;
    expect(sendEmailGCNotificationStub).to.be.calledOnce;
  });
});
