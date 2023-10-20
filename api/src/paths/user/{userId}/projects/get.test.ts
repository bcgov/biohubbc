import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as projects from './get';

chai.use(sinonChai);

describe('projects', () => {
  describe('getAllUserProjects', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('finds user by Id and returns 200 and result on success', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      const getProjectsBySystemUserIdStub = sinon
        .stub(ProjectParticipationService.prototype, 'getProjectsBySystemUserId')
        .resolves([
          {
            project_id: 123,
            project_name: 'projectname',
            system_user_id: 12,
            project_role_ids: [42],
            project_role_names: ['Role1'],
            project_role_permissions: ['Permission1'],
            project_participation_id: 88
          }
        ]);

      const requestHandler = projects.getAllUserProjects();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(getProjectsBySystemUserIdStub).to.have.been.calledOnceWith(1);

      expect(mockRes.jsonValue).to.eql([
        {
          project_id: 123,
          project_name: 'projectname',
          system_user_id: 12,
          project_role_ids: [42],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          project_participation_id: 88
        }
      ]);
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      const getProjectsBySystemUserIdStub = sinon
        .stub(ProjectParticipationService.prototype, 'getProjectsBySystemUserId')
        .rejects(new Error('a test error'));

      const requestHandler = projects.getAllUserProjects();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;
        expect(getProjectsBySystemUserIdStub).to.have.been.calledOnceWith(1);

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
