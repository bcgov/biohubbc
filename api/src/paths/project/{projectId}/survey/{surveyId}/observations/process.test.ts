import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../services/observation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as process from './process';

chai.use(sinonChai);

describe('processFile', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 2
    },
    body: {}
  } as any;

  it('should throw an error if failure occurs', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('Error');
    sinon.stub(ObservationService.prototype, 'processObservationCsvSubmission').rejects(expectedError);

    try {
      const result = process.processFile();

      await result(mockReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(ObservationService.prototype, 'processObservationCsvSubmission').resolves({} as any);
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = process.processFile();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockRes.status).to.be.calledWith(200);
    expect(mockRes.json).not.to.have.been.called;
  });
});
