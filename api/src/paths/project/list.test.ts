import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { ProjectService } from '../../services/project-service';
import { getMockDBConnection } from '../../__mocks__/db';
import { GET, getProjectList } from './list';
import * as authorization from '../../request-handlers/security/authorization';

chai.use(sinonChai);

describe('list', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getProjectList', () => {
    const dbConnectionObj = getMockDBConnection();

    const sampleReq = {
      keycloak_token: {},
      system_user: {
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
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
      sinon.stub(ProjectService.prototype, 'getProjectList').resolves([]);

      const result = getProjectList();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([]);
    });

    it('returns an array of projects', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(authorization, 'userHasValidRole').returns(true);

      const mockProject1 = ({ project: { project_id: 1 } } as unknown) as any;
      const mockProject2 = ({ project: { project_id: 2 } } as unknown) as any;

      sinon.stub(ProjectService.prototype, 'getProjectList').resolves([mockProject1, mockProject2]);

      const result = getProjectList();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([mockProject1, mockProject2]);
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(ProjectService.prototype, 'getProjectList').rejects(new Error('a test error'));

      try {
        const requestHandler = getProjectList();

        await requestHandler(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
