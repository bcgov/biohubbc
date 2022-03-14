import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { GetPermitData } from '../../../models/project-view';
import { ProjectService } from '../../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as update from './update';

chai.use(sinonChai);

describe('update', () => {
  describe('getProjectForUpdate', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no projectId', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: ''
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.getProjectForUpdate();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
      }
    });

    it('should return selected entities', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const sampleResponse = {
        id: 1,
        coordinator: null,
        permit: new GetPermitData(),
        project: null,
        objectives: null,
        location: null,
        iucn: null,
        funding: null,
        partnerships: null
      };

      mockReq.params = {
        projectId: '1'
      };

      mockReq.query = {
        entity: ['permit']
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(ProjectService.prototype, 'getProjectEntitiesById').resolves(sampleResponse);

      const requestHandler = update.getProjectForUpdate();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(ProjectService.prototype.getProjectEntitiesById).called.calledWith(1, ['permit']);
      expect(mockRes.sendValue).to.equal(sampleResponse);
    });
  });

  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no projectId', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: ''
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updateProject();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
      }
    });

    it('should throw a 400 error when no request body', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1'
      };

      mockReq.body = null;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updateProject();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required request body');
      }
    });

    it('updates a project with all valid entries and returns 200 on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        projectId: '1'
      };

      mockReq.body = {
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: '2022-02-02',
          end_date: '2022-02-30',
          objectives: 'my objectives',
          publish_date: '2022-02-02',
          revision_count: 0
        },
        iucn: {},
        contact: {},
        permit: {},
        funding: {},
        partnerships: {},
        location: {}
      };

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(ProjectService.prototype, 'updateProject').resolves();

      const requestHandler = update.updateProject();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
    });
  });
});
