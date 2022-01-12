import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { SYSTEM_ROLE } from '../constants/roles';
import { COMPLETION_STATUS } from '../constants/status';
import * as db from '../database/db';
import { HTTPError } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as projects from './projects';

chai.use(sinonChai);

describe('getProjectList', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('throws a 500 error if the get project list SQL fails to build', async () => {
    const mockDBConnection = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(queries.project, 'getProjectListSQL').returns(null);

    const requestHandler = projects.getProjectList();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Failed to build SQL select statement');
      expect((error as HTTPError).status).to.equal(500);
    }
  });

  it('returns an array of project objects', async () => {
    const mockQuery = sinon.stub();
    mockQuery.resolves({
      rows: [
        { id: 1, publish_timestamp: '2021-11-10' },
        { id: 2, end_date: '2021-11-10' }
      ]
    });

    const mockDBConnection = getMockDBConnection({ query: mockQuery });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(queries.project, 'getProjectListSQL').returns(SQL`valid sql`);

    const requestHandler = projects.getProjectList();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql([
      {
        id: 1,
        name: undefined,
        start_date: undefined,
        end_date: undefined,
        coordinator_agency: undefined,
        publish_status: 'Published',
        completion_status: COMPLETION_STATUS.ACTIVE,
        project_type: undefined,
        permits_list: undefined
      },
      {
        id: 2,
        name: undefined,
        start_date: undefined,
        end_date: '2021-11-10',
        coordinator_agency: undefined,
        publish_status: 'Unpublished',
        completion_status: COMPLETION_STATUS.COMPLETED,
        project_type: undefined,
        permits_list: undefined
      }
    ]);
  });
});
