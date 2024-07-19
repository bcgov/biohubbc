import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/http-error';
import {
  IAdministrativeActivityStanding,
  ICreateAdministrativeActivity
} from '../repositories/administrative-activity-repository';
import { AdministrativeActivityService } from '../services/administrative-activity-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import { createAdministrativeActivity, GET, getAdministrativeActivityStanding, POST } from './administrative-activity';

chai.use(sinonChai);

describe('openapi schema', () => {
  const ajv = new Ajv();

  describe('POST', () => {
    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(POST.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('GET', () => {
    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });
});

describe('createAdministrativeActivity', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('fetches a project', async () => {
    const systemUserId = 1;

    const dbConnectionObj = getMockDBConnection({ systemUserId: () => systemUserId, commit: sinon.stub() });
    sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

    const mockResponse: ICreateAdministrativeActivity = { id: 2, date: '2023-01-01' };

    sinon.stub(AdministrativeActivityService.prototype, 'createPendingAccessRequest').resolves(mockResponse);
    sinon.stub(AdministrativeActivityService.prototype, 'sendAccessRequestNotificationEmailToAdmin').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      myData: 'the data'
    };

    const requestHandler = createAdministrativeActivity();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(dbConnectionObj.commit).to.have.been.calledOnce;

    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql(mockResponse);
  });

  it('catches and re-throws error', async () => {
    const systemUserId = 1;

    const dbConnectionObj = getMockDBConnection({
      systemUserId: () => systemUserId,
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

    sinon
      .stub(AdministrativeActivityService.prototype, 'createPendingAccessRequest')
      .rejects(new Error('a test error'));
    sinon.stub(AdministrativeActivityService.prototype, 'sendAccessRequestNotificationEmailToAdmin').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      myData: 'the data'
    };
    try {
      const requestHandler = createAdministrativeActivity();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});

describe('getAdministrativeActivityStanding', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('fetches administrative activities', async () => {
    const systemUserId = 1;

    const dbConnectionObj = getMockDBConnection({ systemUserId: () => systemUserId, commit: sinon.stub() });
    sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

    const mockResponse: IAdministrativeActivityStanding = {
      has_pending_access_request: true,
      has_one_or_more_project_roles: true
    };

    sinon.stub(AdministrativeActivityService.prototype, 'getAdministrativeActivityStanding').resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockreq.keycloak_token = {
      idir_user_guid: 'testguid',
      identity_provider: 'idir',
      idir_username: 'testuser',
      email_verified: false,
      name: 'test user',
      preferred_username: 'testguid@idir',
      display_name: 'test user',
      given_name: 'test',
      family_name: 'user',
      email: 'email@email.com'
    };
    mockReq.body = {
      myData: 'the data'
    };

    const requestHandler = getAdministrativeActivityStanding();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(dbConnectionObj.commit).to.have.been.calledOnce;

    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql(mockResponse);
  });

  it('catches and re-throws error', async () => {
    const systemUserId = 1;

    const dbConnectionObj = getMockDBConnection({
      systemUserId: () => systemUserId,
      release: sinon.stub()
    });

    sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

    sinon
      .stub(AdministrativeActivityService.prototype, 'getAdministrativeActivityStanding')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockreq.keycloak_token = {
      idir_user_guid: 'testguid',
      identity_provider: 'idir',
      idir_username: 'testuser',
      email_verified: false,
      name: 'test user',
      preferred_username: 'testguid@idir',
      display_name: 'test user',
      given_name: 'test',
      family_name: 'user',
      email: 'email@email.com'
    };
    mockReq.body = {
      myData: 'the data'
    };

    try {
      const requestHandler = getAdministrativeActivityStanding();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
