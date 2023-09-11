import chai, { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../errors/http-error';
import { Models } from '../../models';
import { AuthorizationService } from '../../services/authorization-service';
import { getRequestHandlerMocks, registerMockDBConnection } from '../../__mocks__/db';
import * as authorization from './authorization';

chai.use(sinonChai);

describe('authorizeRequestHandler', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws a 403 error if the user is not authorized', async function () {
    registerMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(false);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Access Denied');
      expect((error as HTTPError).status).to.equal(403);
    }

    expect(mockNext).not.to.have.been.called;
  });

  it('calls next if the user is authorized', async function () {
    registerMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(true);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockNext).to.have.been.calledOnce;
  });
});

describe('authorizeRequest', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if systemUserObject is null', async function () {
    registerMockDBConnection();

    const mockSystemUserObject = (undefined as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if the user is a system administrator', async function () {
    registerMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the authorization_scheme is undefined', async function () {
    registerMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    const mockReq = ({ authorization_scheme: undefined } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the user is authorized against the authorization_scheme', async function () {
    registerMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizationScheme').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if the user is not authorized against the authorization_scheme', async function () {
    registerMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizationScheme').resolves(false);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns false if an error is thrown', async function () {
    registerMockDBConnection({
      open: sinon.stub().callsFake(() => {
        throw new Error('Test Error');
      })
    });

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });
});
