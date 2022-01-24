import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as get_project_participants from './get';

chai.use(sinonChai);

describe('gets a list of project participants', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = get_project_participants.getParticipants();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `projectId`');
    }
  });

  it('should catch and re-throw an error if ProjectService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    sinon.stub(ProjectService.prototype, 'getProjectParticipants').rejects(new Error('an error'));

    try {
      const requestHandler = get_project_participants.getParticipants();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return participants on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1'
    };

    sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves([{ id: 1 }]);

    const requestHandler = get_project_participants.getParticipants();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ participants: [{ id: 1 }] });
  });
});
