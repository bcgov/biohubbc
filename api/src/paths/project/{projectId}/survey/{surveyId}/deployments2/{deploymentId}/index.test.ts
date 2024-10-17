import { expect } from 'chai';
import sinon from 'sinon';
import { deleteDeployment, getDeploymentById, updateDeployment } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import {
  BctwDeploymentRecordWithDeviceMeta,
  BctwDeploymentService
} from '../../../../../../../services/bctw-service/bctw-deployment-service';
import { BctwDeviceService } from '../../../../../../../services/bctw-service/bctw-device-service';
import { CritterbaseService, ICapture } from '../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('getDeploymentById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Gets an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockRemoveDeployment = sinon.stub(DeploymentService.prototype, 'getDeploymentById').resolves({
      deployment_id: 3,
      critter_id: 2,
      critterbase_critter_id: '333',
      bctw_deployment_id: '444',
      critterbase_start_capture_id: '555',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    });
    const mockBctwService = sinon.stub(BctwDeploymentService.prototype, 'getDeploymentsByIds').resolves([
      {
        critter_id: '333',
        assignment_id: '666',
        collar_id: '777',
        attachment_start: '2021-01-01',
        attachment_end: '2021-01-02',
        deployment_id: '444',
        device_id: 888,
        created_at: '2021-01-01',
        created_by_user_id: '999',
        updated_at: null,
        updated_by_user_id: null,
        valid_from: '2021-01-01',
        valid_to: null,
        device_make: 17,
        device_model: 'model',
        frequency: 1,
        frequency_unit: 2
      }
    ]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = getDeploymentById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockRemoveDeployment).to.have.been.calledOnce;
    expect(mockBctwService).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });

  it('throws 400 error if no SIMS deployment record matches provided deployment ID', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

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

    const getDeploymentByIdStub = sinon.stub(DeploymentService.prototype, 'getDeploymentById').resolves();
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66',
      deploymentId: '77'
    };

    const requestHandler = getDeploymentById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('Deployment ID does not exist.');
      expect((actualError as HTTPError).status).to.equal(400);

      expect(getDeploymentByIdStub).calledOnceWith(77);
      expect(getDeploymentsByIdsStub).not.to.have.been.called;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });

  it('returns bad deployment record if more than 1 active deployment found in BCTW for the SIMS deployment record', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployment = {
      deployment_id: 3,
      critter_id: 2,
      critterbase_critter_id: '333',
      bctw_deployment_id: '444',
      critterbase_start_capture_id: '555',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    };

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

    const getDeploymentByIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentById')
      .resolves(mockSIMSDeployment);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66',
      deploymentId: '77'
    };

    const requestHandler = getDeploymentById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentByIdStub).calledOnceWith(77);
    expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
    expect(mockRes.json).calledOnceWith({
      deployment: null,
      bad_deployment: {
        name: 'BCTW Data Error',
        message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
        data: {
          sims_deployment_id: 3,
          bctw_deployment_id: '444'
        }
      }
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('returns bad deployment record if no active deployment found in BCTW for the SIMS deployment record', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployment = {
      deployment_id: 3,
      critter_id: 2,
      critterbase_critter_id: '333',
      bctw_deployment_id: '444',
      critterbase_start_capture_id: '555',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    };

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

    const getDeploymentByIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentById')
      .resolves(mockSIMSDeployment);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .resolves(mockBCTWDeployments);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66',
      deploymentId: '77'
    };

    const requestHandler = getDeploymentById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDeploymentByIdStub).calledOnceWith(77);
    expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
    expect(mockRes.json).calledOnceWith({
      deployment: null,
      bad_deployment: {
        name: 'BCTW Data Error',
        message: 'No active deployments found for deployment ID, when one should exist.',
        data: {
          sims_deployment_id: 3,
          bctw_deployment_id: '444'
        }
      }
    });
    expect(mockRes.status).calledOnceWith(200);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSIMSDeployment = {
      deployment_id: 3,
      critter_id: 2,
      critterbase_critter_id: '333',
      bctw_deployment_id: '444',
      critterbase_start_capture_id: '555',
      critterbase_end_capture_id: null,
      critterbase_end_mortality_id: null
    };

    const mockError = new Error('Test error');

    const getDeploymentByIdStub = sinon
      .stub(DeploymentService.prototype, 'getDeploymentById')
      .resolves(mockSIMSDeployment);
    const getDeploymentsByIdsStub = sinon
      .stub(BctwDeploymentService.prototype, 'getDeploymentsByIds')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '55',
      surveyId: '66',
      deploymentId: '77'
    };

    const requestHandler = getDeploymentById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(getDeploymentByIdStub).calledOnceWith(77);
      expect(getDeploymentsByIdsStub).calledOnceWith(['444']);
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });
});

describe('updateDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockCapture: ICapture = {
      capture_id: '111',
      critter_id: '222',
      capture_method_id: null,
      capture_location_id: '333',
      release_location_id: null,
      capture_date: '2021-01-01',
      capture_time: '12:00:00',
      release_date: null,
      release_time: null,
      capture_comment: null,
      release_comment: null
    };

    const mockBctwDeploymentResponse = [
      {
        assignment_id: '666',
        collar_id: '777',
        critter_id: '333',
        created_at: '2021-01-01',
        created_by_user_id: '999',
        updated_at: null,
        updated_by_user_id: null,
        valid_from: '2021-01-01',
        valid_to: null,
        attachment_start: '2021-01-01',
        attachment_end: '2021-01-02',
        deployment_id: '444'
      }
    ];

    const updateDeploymentStub = sinon.stub(DeploymentService.prototype, 'updateDeployment').resolves();
    const getCaptureByIdStub = sinon.stub(CritterbaseService.prototype, 'getCaptureById').resolves(mockCapture);
    const updateBctwDeploymentStub = sinon
      .stub(BctwDeploymentService.prototype, 'updateDeployment')
      .resolves(mockBctwDeploymentResponse);
    const updateCollarStub = sinon.stub(BctwDeviceService.prototype, 'updateCollar').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = updateDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(updateDeploymentStub).to.have.been.calledOnce;
    expect(getCaptureByIdStub).to.have.been.calledOnce;
    expect(updateBctwDeploymentStub).to.have.been.calledOnce;
    expect(updateCollarStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const updateDeploymentStub = sinon.stub(DeploymentService.prototype, 'updateDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = updateDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(updateDeploymentStub).to.have.been.calledOnce;
    }
  });
});

describe('deleteDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteDeploymentStub = sinon
      .stub(DeploymentService.prototype, 'deleteDeployment')
      .resolves({ bctw_deployment_id: '444' });
    const bctwDeleteDeploymentStub = sinon.stub(BctwDeploymentService.prototype, 'deleteDeployment');

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      deploymentId: '3'
    };

    const requestHandler = deleteDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(deleteDeploymentStub).to.have.been.calledOnce;
    expect(bctwDeleteDeploymentStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });
});
