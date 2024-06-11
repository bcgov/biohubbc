import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import * as authorization from '../../request-handlers/security/authorization';
import { COMPLETION_STATUS, ProjectService } from '../../services/project-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as index from './index';

chai.use(sinonChai);

describe('index', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(index.GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  describe('findProjects', () => {
    const dbConnectionObj = getMockDBConnection();

    const sampleReq = {
      keycloak_token: {},
      system_user: {
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      }
    } as any;

    sampleReq.query = {
      page: '1',
      limit: '10'
    };

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

    afterEach(() => {
      sinon.restore();
    });

    it('returns an empty array if no project ids are found', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(authorization, 'userHasValidRole').returns(true);
      sinon.stub(ProjectService.prototype, 'findProjects').resolves([]);
      sinon.stub(ProjectService.prototype, 'findProjectCount').resolves(0);

      const result = index.getProjects();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql({
        pagination: {
          current_page: 1,
          last_page: 1,
          total: 0,
          sort: undefined,
          order: undefined,
          per_page: 10
        },
        projects: []
      });
    });

    it('returns an array of projects', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(authorization, 'userHasValidRole').returns(true);

      const getProjectindexStub = sinon.stub(ProjectService.prototype, 'findProjects').resolves([
        {
          project_id: 1,
          name: 'myproject',
          project_programs: [1],
          start_date: '2022-02-02',
          focal_species: [1],
          types: [1],
          end_date: null,
          regions: [],
          completion_status: COMPLETION_STATUS.COMPLETED
        }
      ]);
      sinon.stub(ProjectService.prototype, 'findProjectCount').resolves(1);

      const result = index.getProjects();

      await result(sampleReq, sampleRes as unknown as any, null as unknown as any);

      expect(actualResult).to.eql({
        pagination: {
          current_page: 1,
          last_page: 1,
          total: 1,
          sort: undefined,
          order: undefined,
          per_page: 10
        },
        projects: [
          {
            project_id: 1,
            name: 'myproject',
            project_programs: [1],
            start_date: '2022-02-02',
            end_date: null,
            regions: [],
            completion_status: COMPLETION_STATUS.COMPLETED
          }
        ]
      });
      expect(getProjectindexStub).to.be.calledOnce;
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(ProjectService.prototype, 'findProjects').rejects(new Error('a test error'));

      try {
        const requestHandler = index.getProjects();

        await requestHandler(sampleReq, sampleRes as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
