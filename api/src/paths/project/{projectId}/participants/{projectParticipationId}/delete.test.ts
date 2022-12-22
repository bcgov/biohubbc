import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { ProjectService } from '../../../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as doAllProjectsHaveAProjectLead from '../../../../user/{userId}/delete';
import * as delete_project_participant from './delete';

chai.use(sinonChai);

describe('Delete a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 500 error when deleteProjectParticipationRecord fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves();
    sinon.stub(ProjectService.prototype, 'getProjectParticipants').resolves([{ id: 1 }]);
    sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead').returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to delete project participant');
    }
  });

  it('should throw a 400 error when user is only project lead', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([{ id: 1 }]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([{ id: 2 }]);
    doAllProjectsHaveLead.onCall(1).returns(false);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = delete_project_participant.deleteProjectParticipant();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete project user. User is the only Project Lead for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });
    const getProjectParticipant = sinon.stub(ProjectService.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(doAllProjectsHaveAProjectLead, 'doAllProjectsHaveAProjectLead');

    getProjectParticipant.onCall(0).resolves([{ id: 1 }]);
    doAllProjectsHaveLead.onCall(0).returns(true);
    getProjectParticipant.onCall(1).resolves([{ id: 2 }]);
    doAllProjectsHaveLead.onCall(1).returns(true);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const requestHandler = delete_project_participant.deleteProjectParticipant();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
