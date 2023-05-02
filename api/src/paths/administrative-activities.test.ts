import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as administrative_activities from './administrative-activities';
import { QueryResult } from 'pg';

chai.use(sinonChai);

describe('openapi schema', () => {
  // @TODO;
});

describe('getAdministrativeActivities', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the rows on success (empty)', async () => {
    const mockDBConnection = getMockDBConnection({
      sql: async () => {
        return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
      }
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      type: ['type'],
      status: ['status']
    };

    const requestHandler = administrative_activities.getAdministrativeActivities();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([]);
  });

  it('should return the rows on success (not empty)', async () => {
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

    const mockDBConnection = getMockDBConnection({
      sql: async () => {
        return ({ rowCount: 1, rows: [data] } as any) as Promise<QueryResult<any>>;
      }
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      type: ['type'],
      status: ['status']
    };

    const requestHandler = administrative_activities.getAdministrativeActivities();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([data]);
  });
});
