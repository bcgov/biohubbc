import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectService } from './project-service';

chai.use(sinonChai);

describe('ProjectService', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectService.prototype, 'getProjectParticipant')
        .resolves('existing participant');

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon.stub(ProjectService.prototype, 'getProjectParticipant').resolves(null);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(null);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipant(projectId, systemUserId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipant(projectId, systemUserId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns null if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      expect(result).to.equal(null);
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('getProjectParticipants', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(null);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('addProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(null);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project team member');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should not throw an error on success', async () => {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const addProjectRoleByRoleIdSQLStub = sinon
        .stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL')
        .returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);

      expect(addProjectRoleByRoleIdSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('getPublicProjectsList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.public, 'getPublicProjectListSQL').returns(null);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getPublicProjectsList();
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.public, 'getPublicProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPublicProjectsList();

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [
        {
          id: 123,
          name: 'Project 1',
          start_date: '1900-01-01',
          end_date: '2000-10-10',
          coordinator_agency: 'Agency 1',
          permits_list: '3, 100',
          project_type: 'Aquatic Habitat'
        },
        {
          id: 456,
          name: 'Project 2',
          start_date: '1900-01-01',
          end_date: '2000-12-31',
          coordinator_agency: 'Agency 2',
          permits_list: '1, 4',
          project_type: 'Terrestrial Habitat'
        }
      ];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.public, 'getPublicProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPublicProjectsList();

      expect(result[0].id).to.equal(123);
      expect(result[0].name).to.equal('Project 1');
      expect(result[0].completion_status).to.equal('Completed');

      expect(result[1].id).to.equal(456);
      expect(result[1].name).to.equal('Project 2');
      expect(result[1].completion_status).to.equal('Completed');
    });
  });

  describe('getProjectList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'getProjectListSQL').returns(null);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectList(true, 1, {});
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectList(true, 1, {});

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [
        {
          id: 123,
          name: 'Project 1',
          start_date: '1900-01-01',
          end_date: '2200-10-10',
          coordinator_agency: 'Agency 1',
          publish_timestamp: '2010-01-01',
          permits_list: '3, 100',
          project_type: 'Aquatic Habitat'
        },
        {
          id: 456,
          name: 'Project 2',
          start_date: '1900-01-01',
          end_date: '2000-12-31',
          coordinator_agency: 'Agency 2',
          publish_timestamp: '',
          permits_list: '1, 4',
          project_type: 'Terrestrial Habitat'
        }
      ];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectListSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectList(true, 1, {});

      expect(result[0].id).to.equal(123);
      expect(result[0].name).to.equal('Project 1');
      expect(result[0].completion_status).to.equal('Active');
      expect(result[0].publish_status).to.equal('Published');

      expect(result[1].id).to.equal(456);
      expect(result[1].name).to.equal('Project 2');
      expect(result[1].completion_status).to.equal('Completed');
      expect(result[1].publish_status).to.equal('Unpublished');
    });
  });

  describe.only('getPublicProjectById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.public, 'getPublicProjectSQL').returns(null);
      sinon.stub(queries.public, 'getActivitiesByPublicProjectSQL').returns(null);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getPublicProjectById(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });
  });
});
