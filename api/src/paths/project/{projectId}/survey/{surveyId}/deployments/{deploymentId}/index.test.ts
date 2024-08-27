import { expect } from 'chai';
import sinon from 'sinon';
import { deleteDeployment, getDeploymentById, updateDeployment } from '.';
import * as db from '../../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../../services/bctw-service/bctw-deployment-service';
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
