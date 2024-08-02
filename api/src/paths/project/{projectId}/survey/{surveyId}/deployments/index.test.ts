import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import { IBctwDeploymentRecord } from '../../../../../../models/bctw';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { getDeploymentsInSurvey } from '.';

describe('getDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockDeployments: IBctwDeploymentRecord[] = [
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
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 11,
        critter_id: 22,
        bctw_deployment_id: 'deployment1'
      }
    ];
    const mockSIMSCritters = [
      {
        critter_id: 22,
        survey_id: 33,
        critterbase_critter_id: 'critterbase1'
      }
    ];
    const mockBCTWDeployments: IDeploymentRecord[] = [
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

    const getDeploymentsBySurveyIdStub = sinon
      .stub(TelemetryService.prototype, 'getDeploymentsBySurveyId')
      .resolves(mockSIMSDeployments);

    const getCrittersInSurveyStub = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves(mockCritters);
    const getDeploymentsByCritterId = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByCritterId')
      .resolves(mockDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsBySurveyIdStub).calledOnceWith(66);
    expect(getCrittersInSurveyStub).calledOnceWith(66);
    expect(getDeploymentsByCritterIdStub).calledOnceWith(['critterbase1']);

    expect(mockRes.json).calledOnceWith(mockBCTWDeployments);
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns early an empty array if no SIMS deployment records for survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments: Deployment[] = []; // No SIMS deployments
    const mockSIMSCritters = [
      {
        critter_id: 22,
        survey_id: 33,
        critterbase_critter_id: 'critterbase1'
      }
    ];
    const mockBCTWDeployments: IDeploymentRecord[] = [
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

    const getDeploymentsBySurveyIdStub = sinon
      .stub(TelemetryService.prototype, 'getDeploymentsBySurveyId')
      .resolves(mockSIMSDeployments);

    const getCrittersInSurveyStub = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves(mockSIMSCritters);

    const getDeploymentsByCritterIdStub = sinon
      .stub(BctwService.prototype, 'getDeploymentsByCritterId')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsBySurveyIdStub).calledOnceWith(66);
    expect(getCrittersInSurveyStub).not.called;
    expect(getDeploymentsByCritterIdStub).not.called;

    expect(mockRes.json).calledOnceWith([]);
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns early an empty array if no SIMS critter records for survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 11,
        critter_id: 22,
        bctw_deployment_id: 'deployment1'
      }
    ];
    const mockSIMSCritters: SurveyCritterRecord[] = []; // No SIMS critters
    const mockBCTWDeployments: IDeploymentRecord[] = [
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

    const getDeploymentsBySurveyIdStub = sinon
      .stub(TelemetryService.prototype, 'getDeploymentsBySurveyId')
      .resolves(mockSIMSDeployments);

    const getCrittersInSurveyStub = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .resolves(mockSIMSCritters);

    const getDeploymentsByCritterIdStub = sinon
      .stub(BctwService.prototype, 'getDeploymentsByCritterId')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsBySurveyIdStub).calledOnceWith(66);
    expect(getCrittersInSurveyStub).calledOnceWith(66);
    expect(getDeploymentsByCritterIdStub).not.called;

    expect(mockRes.json).calledOnceWith([]);
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 11,
        critter_id: 22,
        bctw_deployment_id: 'deployment1'
      }
    ];

    const getDeploymentsBySurveyIdStub = sinon
      .stub(TelemetryService.prototype, 'getDeploymentsBySurveyId')
      .resolves(mockSIMSDeployments);

    const mockError = new Error('a test error');
    const getCrittersInSurveyStub = sinon
      .stub(SurveyCritterService.prototype, 'getCrittersInSurvey')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(getDeploymentsBySurveyIdStub).calledOnceWith(66);
      expect(getCrittersInSurveyStub).calledOnceWith(66);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
