import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { AdministrativeActivitiesService } from '../../../../services/administrative-activities-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../../administrative-activities';
import * as reject_request from './reject';

chai.use(sinonChai);

describe('rejectAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('re-throws any error that is thrown', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      administrativeActivityId: '1'
    };

    const expectedError = new Error('test error');
    sinon.stub(AdministrativeActivitiesService.prototype, 'putAdministrativeActivity').rejects(expectedError);

    const requestHandler = reject_request.rejectAccessRequest();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect(error).to.equal(expectedError);
    }
  });

  it('updates administrative activity as rejected', async () => {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      administrativeActivityId: '1'
    };

    const updateAdministrativeActivityStub = sinon.stub(AdministrativeActivitiesService.prototype, 'putAdministrativeActivity').resolves();

    const requestHandler = reject_request.rejectAccessRequest();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(updateAdministrativeActivityStub).to.have.been.calledOnceWith(1, ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.REJECTED);
  });
});
