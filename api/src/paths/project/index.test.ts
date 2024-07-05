import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { FindProjectsResponse } from '../../models/project-view';
import { ProjectService } from '../../services/project-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findProjects } from './index';

chai.use(sinonChai);

describe('findProjects', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns projects', async () => {
    const mockFindProjectsResponse: FindProjectsResponse[] = [
      {
        project_id: 1,
        name: 'project name',
        start_date: '2021-01-01',
        end_date: '2021-12-31',
        regions: ['region1'],
        focal_species: [123, 456],
        types: [1, 2, 3]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findProjectsStub = sinon.stub(ProjectService.prototype, 'findProjects').resolves(mockFindProjectsResponse);

    const findProjectsCountStub = sinon.stub(ProjectService.prototype, 'findProjectsCount').resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      project_name: 'project name',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq['keycloak_token'] = {};
    mockReq['system_user'] = {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findProjects();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findProjectsStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findProjectsCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.projects).to.eql(mockFindProjectsResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindProjectsResponse: FindProjectsResponse[] = [
      {
        project_id: 1,
        name: 'project name',
        start_date: '2021-01-01',
        end_date: '2021-12-31',
        regions: ['region1'],
        focal_species: [123, 456],
        types: [1, 2, 3]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findProjectsStub = sinon.stub(ProjectService.prototype, 'findProjects').resolves(mockFindProjectsResponse);

    const findProjectsCountStub = sinon
      .stub(ProjectService.prototype, 'findProjectsCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      project_name: 'project name',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq['keycloak_token'] = {};
    mockReq['system_user'] = {
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findProjects();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findProjectsStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findProjectsCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
