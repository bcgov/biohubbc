import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../database/db';
import { BctwService, IDeploymentRecord } from '../../../../../services/bctw-service';
import { SurveyCritterService } from '../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import { getDeploymentsInSurvey } from './deployments';

describe('getDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockDeployments: IDeploymentRecord[] = [
    {
      critter_id: 'critterbase1',
      assignment_id: 'assignment1',
      collar_id: 'collar1',
      attachment_start: '2020-01-01',
      attachment_end: '2020-01-02',
      deployment_id: 'deployment1',
      device_id: 123,
      created_at: '2020-01-01',
      created_by_user_id: 'user1',
      updated_at: '2020-01-01',
      updated_by_user_id: 'user1',
      valid_from: '2020-01-01',
      valid_to: '2020-01-02'
    }
  ];
  const mockCritters = [{ critter_id: 123, survey_id: 123, critterbase_critter_id: 'critterbase1' }];

  it('gets deployments in survey', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves(mockCritters);
    const getDeploymentsByCritterId = sinon
      .stub(BctwService.prototype, 'getDeploymentsByCritterId')
      .resolves(mockDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
    expect(getDeploymentsByCritterId.calledOnce).to.be.true;
    expect(mockRes.json.calledWith(mockDeployments)).to.be.true;
    expect(mockRes.status.calledWith(200)).to.be.true;
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockGetCrittersInSurvey = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .rejects(mockError);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getDeploymentsInSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCrittersInSurvey.calledOnce).to.be.true;
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockDBConnection.release).to.have.been.called;
    }
  });
});
