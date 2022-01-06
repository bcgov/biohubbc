import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as projects from './projects';
import * as db from '../../database/db';
import public_queries from '../../queries/public';
import SQL from 'sql-template-strings';
import { COMPLETION_STATUS } from '../../constants/status';
import { getMockDBConnection } from '../../__mocks__/db';
import { HTTPError } from '../../errors/custom-error';

chai.use(sinonChai);

describe('getPublicProjectsList', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
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

  it('should throw a 400 error when no sql statement returned for getPublicProjectListSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectListSQL').returns(null);

    try {
      const result = projects.getPublicProjectsList();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return all public projects on success', async () => {
    const projectsList = [
      {
        id: 1,
        name: 'name',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        coordinator_agency_name: 'agency',
        project_type: 'type',
        permits_list: [123, 1233]
      }
    ];

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: projectsList });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectListSQL').returns(SQL`some query`);

    const result = projects.getPublicProjectsList();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([
      {
        id: projectsList[0].id,
        name: projectsList[0].name,
        start_date: projectsList[0].start_date,
        end_date: projectsList[0].end_date,
        coordinator_agency: projectsList[0].coordinator_agency_name,
        completion_status: COMPLETION_STATUS.COMPLETED,
        project_type: projectsList[0].project_type,
        permits_list: projectsList[0].permits_list
      }
    ]);
  });
});
