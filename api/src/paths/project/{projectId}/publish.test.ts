import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as publish from './publish';
import * as db from '../../../database/db';
import { QueryResult } from 'pg';
import { getMockDBConnection } from '../../../__mocks__/db';
import { HTTPError } from '../../../errors/custom-error';
import { ProjectService } from '../../../services/project-service';

chai.use(sinonChai);

const dbConnectionObj = getMockDBConnection();

const sampleReq = {
  keycloak_token: {},
  params: {
    projectId: 1
  },
  body: {
    publish: true
  }
} as any;

let actualResult = {
  id: null
};

const sampleRes = {
  status: () => {
    return {
      json: (result: any) => {
        actualResult = result;
      }
    };
  }
};

describe('project/{projectId}/publish', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing request param projectId', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishProject();

      await result(
        { ...sampleReq, body: { ...sampleReq.body }, params: { projectId: undefined } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path parameter: projectId');
    }
  });

  it('should throw a 400 error when missing request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishProject();

      await result(
        { ...sampleReq, body: (null as unknown) as any },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing request body');
    }
  });

  it('should throw a 400 error when missing publish flag in request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishProject();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, publish: undefined } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing publish flag in request body');
    }
  });

  it('should return the project id on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rowCount: 1,
          rows: [
            {
              id: 1,
              create_date: '2020/04/04'
            }
          ]
        } as QueryResult<any>;
      }
    });

    sinon.stub(ProjectService.prototype, 'updatePublishStatus').resolves(1);

    const result = publish.publishProject();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult.id).to.equal(1);
  });
});
