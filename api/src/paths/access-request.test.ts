import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/custom-error';
import { UserObject } from '../models/user';
import * as system_user from '../paths-helpers/system-user';
import * as administrative_activity from '../paths/administrative-activity';
import { getMockDBConnection } from '../__mocks__/db';
import * as access_request from './access-request';
import * as system_roles from './user/{userId}/system-roles/create';

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
    const mockReq = {
      body: {
        userIdentifier: 1,
        identitySource: 'identitySource',
        requestId: 1,
        requestStatusTypeId: 1,
        roleIds: [1, 3]
      }
    } as any;

    const mockRes = {} as any;

    const mockNext = {} as any;

    const mockDBConnection = getMockDBConnection({
      open: () => {
        throw new Error('test error');
      }
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const requestHandler = access_request.updateAccessRequest();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('test error');
    }
  });

  it('adds new system roles and updates administrative activity', async () => {
    const requestId = 1;
    const requestStatusTypeId = 2;
    const roleIdsToAdd = [1, 3];

    const mockReq = {
      body: {
        userIdentifier: 'username',
        identitySource: 'identitySource',
        requestId: requestId,
        requestStatusTypeId: requestStatusTypeId,
        roleIds: roleIdsToAdd
      }
    } as any;

    const mockRes = {
      status: sinon.fake(() => {
        return {
          send: sinon.fake()
        };
      })
    } as any;

    const mockNext = {} as any;

    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const systemUserId = 4;
    const existingRoleIds = [1, 2];
    const mockSystemUser = ({ id: systemUserId, role_ids: existingRoleIds } as unknown) as UserObject;
    const ensureSystemUserStub = sinon.stub(system_user, 'ensureSystemUser').resolves(mockSystemUser);

    const addSystemRolesStub = sinon.stub(system_roles, 'addSystemRoles');

    const updateAdministrativeActivityStub = sinon.stub(administrative_activity, 'updateAdministrativeActivity');

    const requestHandler = access_request.updateAccessRequest();

    await requestHandler(mockReq, mockRes, mockNext);

    const expectedRoleIdsToAdd = [3];

    expect(ensureSystemUserStub).to.have.been.calledOnce;
    expect(addSystemRolesStub).to.have.been.calledWith(systemUserId, expectedRoleIdsToAdd, mockDBConnection);
    expect(updateAdministrativeActivityStub).to.have.been.calledWith(requestId, requestStatusTypeId, mockDBConnection);
  });
});
