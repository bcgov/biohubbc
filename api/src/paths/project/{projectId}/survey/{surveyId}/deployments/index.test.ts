import { expect } from 'chai';
import sinon from 'sinon';
import { getDeploymentsInSurvey } from '.';
import * as db from '../../../../../../database/db';
import { SurveyDeployment } from '../../../../../../models/survey-deployment';
import {
  BctwDeploymentRecordWithDeviceMeta,
  BctwDeploymentService
} from '../../../../../../services/bctw-service/bctw-deployment-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

describe('getDeploymentsInSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets deployments in survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 3,
        critter_id: 2,
        critterbase_critter_id: '333',
        bctw_deployment_id: '444',
        critterbase_start_capture_id: '555',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      }
    ];

    const mockBCTWDeployments: BctwDeploymentRecordWithDeviceMeta[] = [
      {
        critter_id: '333',
        assignment_id: 'assignment1',
        collar_id: 'collar1',
        attachment_start: '2020-01-01T00:00:00',
        attachment_end: '2020-01-02T12:12:12',
        deployment_id: '444',
        device_id: 123,
        created_at: '2020-01-01',
        created_by_user_id: 'user1',
        updated_at: '2020-01-01',
        updated_by_user_id: 'user1',
        valid_from: '2020-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      }
    ];

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .resolves(mockSIMSDeployments);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsForSurveyIdStub).calledOnceWith(66);
    expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
    expect(mockRes.json).to.have.been.calledOnceWith({
      deployments: [
        {
          // BCTW properties
          assignment_id: mockBCTWDeployments[0].assignment_id,
          collar_id: mockBCTWDeployments[0].collar_id,
          attachment_start_date: '2020-01-01',
          attachment_start_time: '00:00:00',
          attachment_end_date: '2020-01-02',
          attachment_end_time: '12:12:12',
          bctw_deployment_id: mockBCTWDeployments[0].deployment_id,
          device_id: mockBCTWDeployments[0].device_id,
          device_make: mockBCTWDeployments[0].device_make,
          device_model: mockBCTWDeployments[0].device_model,
          frequency: mockBCTWDeployments[0].frequency,
          frequency_unit: mockBCTWDeployments[0].frequency_unit,
          // SIMS properties
          deployment_id: mockSIMSDeployments[0].deployment_id,
          critter_id: mockSIMSDeployments[0].critter_id,
          critterbase_critter_id: mockSIMSDeployments[0].critterbase_critter_id,
          critterbase_start_capture_id: mockSIMSDeployments[0].critterbase_start_capture_id,
          critterbase_end_capture_id: mockSIMSDeployments[0].critterbase_end_capture_id,
          critterbase_end_mortality_id: mockSIMSDeployments[0].critterbase_end_mortality_id
        }
      ],
      bad_deployments: []
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns early an empty array if no SIMS deployment records for survey', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments: SurveyDeployment[] = []; // no SIMS deployment records

    const mockBCTWDeployments: BctwDeploymentRecordWithDeviceMeta[] = [
      {
        critter_id: '333',
        assignment_id: 'assignment1',
        collar_id: 'collar1',
        attachment_start: '2020-01-01',
        attachment_end: '2020-01-02',
        deployment_id: '444',
        device_id: 123,
        created_at: '2020-01-01',
        created_by_user_id: 'user1',
        updated_at: '2020-01-01',
        updated_by_user_id: 'user1',
        valid_from: '2020-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      }
    ];

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .resolves(mockSIMSDeployments);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsForSurveyIdStub).calledOnceWith(66);
    expect(getDeploymentsByIdsStub).not.to.have.been.called;
    expect(mockRes.json).calledOnceWith({ deployments: [], bad_deployments: [] });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns bad deployment records if more than 1 active deployment found in BCTW for a single SIMS deployment record', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 3,
        critter_id: 2,
        critterbase_critter_id: '333',
        bctw_deployment_id: '444',
        critterbase_start_capture_id: '555',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      }
    ];

    const mockBCTWDeployments: BctwDeploymentRecordWithDeviceMeta[] = [
      {
        critter_id: '333',
        assignment_id: 'assignment1',
        collar_id: 'collar1',
        attachment_start: '2020-01-01',
        attachment_end: '2020-01-02',
        deployment_id: '444',
        device_id: 123,
        created_at: '2020-01-01',
        created_by_user_id: 'user1',
        updated_at: '2020-01-01',
        updated_by_user_id: 'user1',
        valid_from: '2020-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      },
      {
        critter_id: '333',
        assignment_id: 'assignment1',
        collar_id: 'collar1',
        attachment_start: '2020-01-01',
        attachment_end: '2020-01-02',
        deployment_id: '444',
        device_id: 123,
        created_at: '2020-01-01',
        created_by_user_id: 'user1',
        updated_at: '2020-01-01',
        updated_by_user_id: 'user1',
        valid_from: '2020-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      }
    ];

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .resolves(mockSIMSDeployments);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsForSurveyIdStub).calledOnceWith(66);
    expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
    expect(mockRes.json).calledOnceWith({
      deployments: [],
      bad_deployments: [
        {
          name: 'BCTW Data Error',
          message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
          data: {
            sims_deployment_id: 3,
            bctw_deployment_id: '444'
          }
        }
      ]
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns bad deployment records if no active deployment found in BCTW for a single SIMS deployment record', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 3,
        critter_id: 2,
        critterbase_critter_id: '333',
        bctw_deployment_id: '444',
        critterbase_start_capture_id: '555',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      }
    ];

    const mockBCTWDeployments: BctwDeploymentRecordWithDeviceMeta[] = [
      {
        critter_id: '333',
        assignment_id: 'assignment1',
        collar_id: 'collar1',
        attachment_start: '2020-01-01',
        attachment_end: '2020-01-02',
        deployment_id: '444_no_match', // different deployment ID
        device_id: 123,
        created_at: '2020-01-01',
        created_by_user_id: 'user1',
        updated_at: '2020-01-01',
        updated_by_user_id: 'user1',
        valid_from: '2020-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      }
    ];

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .resolves(mockSIMSDeployments);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66'
    };

    const requestHandler = getDeploymentsInSurvey();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentsForSurveyIdStub).calledOnceWith(66);
    expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
    expect(mockRes.json).calledOnceWith({
      deployments: [],
      bad_deployments: [
        {
          name: 'BCTW Data Error',
          message: 'No active deployments found for deployment ID, when one should exist.',
          data: {
            sims_deployment_id: 3,
            bctw_deployment_id: '444'
          }
        }
      ]
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployments = [
      {
        deployment_id: 3,
        critter_id: 2,
        critterbase_critter_id: '333',
        bctw_deployment_id: '444',
        critterbase_start_capture_id: '555',
        critterbase_end_capture_id: null,
        critterbase_end_mortality_id: null
      }
    ];

    const mockError = new Error('Test error');

    const getDeploymentsForSurveyIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentsForSurveyId')
      .resolves(mockSIMSDeployments);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
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
      expect(getDeploymentsForSurveyIdStub).calledOnceWith(66);
      expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});
