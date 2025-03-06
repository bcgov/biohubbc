import { expect } from 'chai';
import sinon from 'sinon';
import { getTelemetryInSurvey } from '.';
import * as db from '../../../../../../database/db';
import {
  Telemetry,
  TelemetryVendorEnum
} from '../../../../../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';

import { TelemetryVendorService } from '../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getTelemetryInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets deployments in survey', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockTelemetry: Telemetry[] = [
      {
        telemetry_id: '123-456-789',
        deployment_id: 2,
        critter_id: 3,
        vendor: TelemetryVendorEnum.VECTRONIC,
        serial: '123456',
        acquisition_date: '2021-01-01T00:00:00.000Z',
        latitude: -49,
        longitude: 125,
        elevation: null,
        temperature: null
      }
    ];

    const mockCount = 1;

    const mockResponse: [Telemetry[], number] = [mockTelemetry, mockCount];

    sinon.stub(TelemetryVendorService.prototype, 'getTelemetryForSurvey').resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getTelemetryInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledOnceWith({
      telemetry: mockTelemetry,
      count: mockCount,
      pagination: {
        total: 1,
        per_page: 1,
        current_page: 1,
        last_page: 1,
        sort: undefined,
        order: undefined
      }
    });
    expect(mockRes.status).calledOnceWith(200);

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    const getTelemetryForSurveyStub = sinon
      .stub(TelemetryVendorService.prototype, 'getTelemetryForSurvey')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getTelemetryInSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getTelemetryForSurveyStub).calledOnce;
      expect(actualError).to.equal(mockError);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
