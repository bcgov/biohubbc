import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import {
  Telemetry,
  TelemetryVendorEnum
} from '../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { TelemetryVendorService } from '../../services/telemetry-services/telemetry-vendor-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { findTelemetry } from './index';

chai.use(sinonChai);

describe('findTelemetry', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns telemetry', async () => {
    const mockFindTelemetryResponse: Telemetry[] = [
      {
        telemetry_id: '789-789-789',
        deployment_id: 2,
        critter_id: 3,
        acquisition_date: '2021-01-01',
        vendor: TelemetryVendorEnum.MANUAL,
        serial: '123',
        latitude: 49.123,
        longitude: -126.123,
        elevation: null,
        temperature: null,
        dop: null
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
      .stub(TelemetryVendorService.prototype, 'findTelemetry')
      .resolves(mockFindTelemetryResponse);

    const findTelemetryCountStub = sinon.stub(TelemetryVendorService.prototype, 'findTelemetryCount').resolves(1);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      start_date: '2021-01-01',
      end_date: '2021-02-01',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [1],
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findTelemetry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findTelemetryStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findTelemetryCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

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
      .stub(TelemetryVendorService.prototype, 'findTelemetry')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      start_date: '2021-01-01',
      end_date: '2021-02-01',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [3],
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

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
