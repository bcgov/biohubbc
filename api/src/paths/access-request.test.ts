import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/custom-error';
import { UserObject } from '../models/user';
import * as administrative_activity from '../paths/administrative-activity';
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
});
