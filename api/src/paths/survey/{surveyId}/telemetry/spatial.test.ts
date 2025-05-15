import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../database/db';
import {
  TelemetrySpatial,
  TelemetrySupplementary
} from '../../../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { TelemetryVendorService } from '../../../../services/telemetry-services/telemetry-vendor-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { getTelemetrySpatialData } from './spatial';

describe('getTelemetrySpatialData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets deployments in survey', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockTelemetry: TelemetrySpatial[] = [
      {
        telemetry_id: '123-456-789',
        geometry: { type: 'Point', coordinates: [-49, 125] }
      }
    ];

    const mockSupplementary = { count: 1, start_date: '2021-01-01', end_date: '2021-01-01' };

    const mockResponse: [TelemetrySpatial[], TelemetrySupplementary] = [mockTelemetry, mockSupplementary];

    sinon.stub(TelemetryVendorService.prototype, 'getTelemetrySpatialForSurvey').resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getTelemetrySpatialData();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledOnceWith({
      telemetry: mockTelemetry,
      supplementaryData: mockSupplementary
    });
    expect(mockRes.status).calledOnceWith(200);

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    const ggetTelemetrySpatialForSurveyStub = sinon
      .stub(TelemetryVendorService.prototype, 'getTelemetrySpatialForSurvey')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getTelemetrySpatialData();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(ggetTelemetrySpatialForSurveyStub).calledOnce;
      expect(actualError).to.equal(mockError);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
