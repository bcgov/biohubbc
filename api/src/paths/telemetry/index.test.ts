import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { SystemUser } from '../../repositories/user-repository';
import { FindTelemetryResponse, TelemetryService } from '../../services/telemetry-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findTelemetry } from './index';

chai.use(sinonChai);

describe('findTelemetry', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns telemetry', async () => {
    const mockFindTelemetryResponse: FindTelemetryResponse[] = [
      {
        telemetry_id: '789-789-789',
        acquisition_date: '2021-01-01',
        latitude: 49.123,
        longitude: -126.123,
        telemetry_type: 'vendor',
        device_id: 123,
        bctw_deployment_id: '123-123-123',
        critter_id: 1,
        deployment_id: 2,
        critterbase_critter_id: '456-456-456',
        animal_id: '678-678-678'
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findTelemetryStub = sinon
      .stub(TelemetryService.prototype, 'findTelemetry')
      .resolves(mockFindTelemetryResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    } as SystemUser;

    const requestHandler = findTelemetry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findTelemetryStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);

    expect(mockRes.jsonValue.telemetry).to.eql(mockFindTelemetryResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findTelemetryStub = sinon
      .stub(TelemetryService.prototype, 'findTelemetry')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    } as SystemUser;

    const requestHandler = findTelemetry();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findTelemetryStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
