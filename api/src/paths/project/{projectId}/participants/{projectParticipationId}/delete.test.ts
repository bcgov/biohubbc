import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { ProjectParticipationRepository } from '../../../../../repositories/project-participation-repository';
import { ProjectParticipationService } from '../../../../../services/project-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
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

    sinon.stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord').resolves();
    sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants').resolves([{ id: 1 }]);
    sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead').returns(true);

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

  it('should throw a 400 error when user is only coordinator', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon
      .stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord')
      .resolves({ system_user_id: 1 });
    const getProjectParticipant = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

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
        'Cannot delete project user. User is the only Coordinator for the project.'
      );
    }
  });

  it('should not throw an error', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const dbConnectionObj = getMockDBConnection();

    mockReq.params = { projectId: '1', projectParticipationId: '2' };

    sinon
      .stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord')
      .resolves({ system_user_id: 1 });
    const getProjectParticipant = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants');
    const doAllProjectsHaveLead = sinon.stub(ProjectParticipationService.prototype, 'doAllProjectsHaveAProjectLead');

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
