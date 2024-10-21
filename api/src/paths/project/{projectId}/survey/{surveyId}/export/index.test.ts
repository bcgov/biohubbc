import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { exportData } from '.';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SystemUser } from '../../../../../../repositories/user-repository';
import { ExportService } from '../../../../../../services/export-services/export-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('exportData', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    // Setup
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(ExportService.prototype, 'export').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = {
      system_user_id: 1,
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    } as SystemUser;

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      methodTechniqueIds: [1, 2, 3]
    };

    const requestHandler = exportData();

    try {
      // Execute
      await requestHandler(mockReq, mockRes, mockNext);

      expect.fail('Expected an error to be thrown');
    } catch (actualError) {
      // Assert
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('returns the s3 signed url for the export data file', async () => {
    // Setup
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(ExportService.prototype, 'export').resolves(['signed-url-for:path/to/file/key']);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = {
      system_user_id: 1,
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    } as SystemUser;

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      config: {
        metadata: true,
        sampling_data: false,
        observation_data: true,
        telemetry_data: true,
        animal_data: false,
        artifacts: false
      }
    };

    // Execute
    const requestHandler = exportData();

    await requestHandler(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.jsonValue).to.eql({ presignedS3Urls: ['signed-url-for:path/to/file/key'] });

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
