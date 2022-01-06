import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import project_participation_queries from '../../../../queries/project-participation';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as projects from './get';

chai.use(sinonChai);

describe('projects', () => {
  const dbConnectionObj = getMockDBConnection();

  describe('getAllUserProjects', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sampleReq = {
      keycloak_token: {},
      params: {
        userId: 1
      }
    } as any;

    let actualResult: any = null;

    const sampleRes = {
      status: () => {
        return {
          json: (result: any) => {
            actualResult = result;
          }
        };
      }
    };

    it('should throw a 400 error when no params are sent', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = projects.getAllUserProjects();

        await result({ ...(sampleReq as any), params: null }, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required params');
      }
    });

    it('should throw a 400 error when no user Id is sent', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = projects.getAllUserProjects();

        await result(
          { ...(sampleReq as any), params: { ...sampleReq.params, userId: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param: userId');
      }
    });

    it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(project_participation_queries, 'getAllUserProjectsSQL').returns(null);

      try {
        const result = projects.getAllUserProjects();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('finds user by Id and returns 200 and result on success', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({
        rows: [{ project_id: 123, name: 'test', system_user_id: 12, project_role_id: 42, project_participation_id: 88 }]
      });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      sinon.stub(project_participation_queries, 'getAllUserProjectsSQL').returns(SQL`something`);

      const result = projects.getAllUserProjects();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([
        { project_id: 123, name: 'test', system_user_id: 12, project_role_id: 42, project_participation_id: 88 }
      ]);
    });
  });
});
