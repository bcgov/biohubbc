import { expect } from 'chai';
import sinon from 'sinon';
import { getDeploymentsInSurvey } from '.';
import * as db from '../../../../../../database/db';
import { DeploymentService } from '../../../../../../services/deployment-services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets deployments in survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockDeployments = [
      {
        // deployment data
        deployment2_id: 1,
        survey_id: 66,
        critter_id: 2,
        device_id: 3,
        frequency: 150.0,
        frequency_unit_id: 1,
        attachment_start_date: '2020-01-01',
        attachment_start_time: '00:00:00',
        attachment_end_date: '2020-01-02',
        attachment_end_time: '12:12:12',
        critterbase_start_capture_id: 'start123',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null,
        // device data
        device_make_id: 1,
        model: 'ModelX',
        // critter data
        critterbase_critter_id: 'critter123'
      }
    ];

    sinon.stub(DeploymentService.prototype, 'getDeploymentsForSurveyId').resolves(mockDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.json).to.have.been.calledOnceWith({ deployments: mockDeployments });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('Test error');

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getDeploymentsInSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getDeploymentsForSurveyIdStub).calledOnce;
      expect(actualError).to.equal(mockError);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
