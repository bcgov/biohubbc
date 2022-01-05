import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import * as project_participation from './project-participation';

chai.use(sinonChai);

describe('user', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(project_participation, 'getProjectParticipant')
        .resolves('existing participant');

      const addProjectParticipantStub = sinon.stub(project_participation, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      try {
        await project_participation.ensureProjectParticipant(
          projectId,
          systemUserId,
          projectParticipantRoleId,
          mockDBConnection
        );
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon.stub(project_participation, 'getProjectParticipant').resolves(null);

      const addProjectParticipantStub = sinon.stub(project_participation, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      try {
        await project_participation.ensureProjectParticipant(
          projectId,
          systemUserId,
          projectParticipantRoleId,
          mockDBConnection
        );
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

      try {
        await project_participation.getProjectParticipant(projectId, systemUserId, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      try {
        await project_participation.getProjectParticipant(projectId, systemUserId, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team member');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns null if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const result = await project_participation.getProjectParticipant(projectId, systemUserId, mockDBConnection);

      expect(result).to.equal(null);
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getProjectParticipationBySystemUserSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const result = await project_participation.getProjectParticipant(projectId, systemUserId, mockDBConnection);

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

      try {
        await project_participation.addProjectParticipant(
          projectId,
          systemUserId,
          projectParticipantRoleId,
          mockDBConnection
        );
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

      try {
        await project_participation.addProjectParticipant(
          projectId,
          systemUserId,
          projectParticipantRoleId,
          mockDBConnection
        );
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

      await project_participation.addProjectParticipant(
        projectId,
        systemUserId,
        projectParticipantRoleId,
        mockDBConnection
      );

      expect(addProjectRoleByRoleIdSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });
});
