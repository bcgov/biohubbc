import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as administrative_activities from './administrative-activities';
import administrative_queries from '../queries/administrative-activity';
import * as db from '../database/db';
import { getMockDBConnection } from '../__mocks__/db';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';

chai.use(sinonChai);

describe('getAdministrativeActivities', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    query: {
      type: 'type',
      status: ['status']
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

  it('should throw a 400 error when failed to build getAdministrativeActivitiesSQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(administrative_queries, 'getAdministrativeActivitiesSQL').returns(null);

    try {
      const result = administrative_activities.getAdministrativeActivities();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the rows on success (empty)', async () => {
    sinon.stub(administrative_queries, 'getAdministrativeActivitiesSQL').returns(SQL`some`);

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null,
      rowCount: 0
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });

    const result = administrative_activities.getAdministrativeActivities();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([]);
  });

  it('should return the rows on success (not empty)', async () => {
    sinon.stub(administrative_queries, 'getAdministrativeActivitiesSQL').returns(SQL`some`);

    const data = {
      id: 1,
      type: 'type',
      type_name: 'type name',
      status: 'status',
      status_name: 'status name',
      description: 'description',
      data: null,
      notes: 'notes',
      create_date: '2020/04/04'
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [data],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({ ...dbConnectionObj, query: mockQuery });

    const result = administrative_activities.getAdministrativeActivities();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([data]);
  });
});
