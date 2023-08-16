import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { ProjectService } from '../../../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as doAllProjectsHaveAProjectLead from '../../../../user/{userId}/delete';
import * as update_project_participant from './update';
chai.use(sinonChai);

describe('update a project participant.', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when delete fails', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

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
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to update project participant role');
    }
  });

  it('should throw a 400 error when user is only coordinator', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });
    sinon.stub(ProjectService.prototype, 'addProjectParticipant').resolves();
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
      const requestHandler = update_project_participant.updateProjectParticipantRole();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Cannot update project user. User is the only Coordinator for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };
    mockReq.body = { roleId: '1' };

    sinon.stub(ProjectService.prototype, 'deleteProjectParticipationRecord').resolves({ system_user_id: 1 });
    sinon.stub(ProjectService.prototype, 'addProjectParticipant').resolves();
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

    const requestHandler = update_project_participant.updateProjectParticipantRole();

    await requestHandler(mockReq, mockRes, mockNext);
    expect(mockRes.statusValue).to.equal(200);
  });
});
