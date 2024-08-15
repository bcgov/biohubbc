import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../database/db';
import { SurveyDeployment } from '../../../../../../../models/survey-deployment';
import { BctwTelemetryService, IAllTelemetry } from '../../../../../../../services/bctw-service/bctw-telemetry-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { getCritterTelemetry } from './telemetry';

describe('getCritterTelemetry', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('fetches telemetry object', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSurveyDeployment: SurveyDeployment = {
      deployment_id: 1,
      critter_id: 123,
      critterbase_critter_id: 'critter-001',
      bctw_deployment_id: '111',
      critterbase_start_capture_id: '222',
      critterbase_end_capture_id: '333',
      critterbase_end_mortality_id: '444'
    };

    const mockTelemetry: IAllTelemetry[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174111',
        deployment_id: '123e4567-e89b-12d3-a456-426614174222',
        latitude: 37.7749,
        longitude: -122.4194,
        acquisition_date: '2023-10-01T12:00:00Z',
        telemetry_type: 'ATS',
        telemetry_id: '123e4567-e89b-12d3-a456-426614174111',
        telemetry_manual_id: null
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174333',
        deployment_id: '123e4567-e89b-12d3-a456-426614174444',
        latitude: 37.775,
        longitude: -122.4195,
        acquisition_date: '2023-10-01T12:05:00Z',
        telemetry_type: 'ATS',
        telemetry_id: null,
        telemetry_manual_id: '123e4567-e89b-12d3-a456-426614174333'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174555',
        deployment_id: '123e4567-e89b-12d3-a456-426614174666',
        latitude: 37.7751,
        longitude: -122.4196,
        acquisition_date: '2023-10-01T12:10:00Z',
        telemetry_type: 'MANUAL',
        telemetry_id: null,
        telemetry_manual_id: '123e4567-e89b-12d3-a456-426614174555'
      }
    ];

    const getDeploymentForCritterIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentForCritterId')
      .resolves(mockSurveyDeployment);

    const getAllTelemetryByDeploymentIdsStub = sinon
      .stub(BctwTelemetryService.prototype, 'getAllTelemetryByDeploymentIds')
      .resolves(mockTelemetry);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params.critterId = '1';

    const requestHandler = getCritterTelemetry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockTelemetry);
    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(getDeploymentForCritterIdStub).to.have.been.calledOnce;
    expect(getAllTelemetryByDeploymentIdsStub).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const getDeploymentForCritterIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentForCritterId')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getCritterTelemetry();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.eql(mockError);
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(getDeploymentForCritterIdStub).to.have.been.calledOnce;
    }
  });
});
