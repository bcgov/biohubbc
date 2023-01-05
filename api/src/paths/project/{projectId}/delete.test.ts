import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { ProjectService } from '../../../services/project-service';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as delete_project from './delete';

chai.use(sinonChai);

describe('deleteProject', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      params: {
        projectId: null
      },
      system_user: { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] }
    } as any;

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: `projectId`');
    }
  });

  it('should throw an error if failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(ProjectService.prototype, 'deleteProject').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      params: {
        projectId: 1
      },
      system_user: { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] }
    } as any;

    try {
      const result = delete_project.deleteProject();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid Id', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const deleteProjectStub = sinon.stub(ProjectService.prototype, 'deleteProject').resolves(true);

    const sampleReq = {
      keycloak_token: {},
      params: {
        projectId: 1
      },
      system_user: { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] }
    } as any;

    const expectedResponse = true;

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
        };
      }
    };

    const result = delete_project.deleteProject();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.eql(expectedResponse);
    expect(deleteProjectStub).to.be.calledOnce;
  });
});
