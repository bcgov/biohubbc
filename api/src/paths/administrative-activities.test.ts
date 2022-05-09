import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../database/db';
import administrative_queries from '../queries/administrative-activity';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as administrative_activities from './administrative-activities';

chai.use(sinonChai);

describe('getAdministrativeActivities', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the rows on success (empty)', async () => {
    sinon.stub(administrative_queries, 'getAdministrativeActivitiesSQL').returns(SQL`some`);

    const mockQuery = sinon.stub().resolves({
      rows: null,
      rowCount: 0
    });

    const mockDBConnection = getMockDBConnection({ query: mockQuery });

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

    const mockQuery = sinon.stub().resolves({
      rows: [data],
      rowCount: 1
    });

    const mockDBConnection = getMockDBConnection({ query: mockQuery });

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
