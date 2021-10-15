import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as view from './view';
import * as db from '../../../database/db';
import * as project_view_queries from '../../../queries/project/project-view-queries';
import * as project_view_update_queries from '../../../queries/project/project-view-update-queries';
import { getMockDBConnection } from '../../../__mocks__/db';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getProjectForView', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1
    }
  } as any;

  it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getProjectPermitsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getLocationByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getActivitiesByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getActivitiesByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getIUCNActionClassificationByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getActivitiesByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIUCNActionClassificationByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getFundingSourceByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getActivitiesByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIUCNActionClassificationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getFundingSourceByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getIndigenousPartnershipsByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getActivitiesByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIUCNActionClassificationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getFundingSourceByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIndigenousPartnershipsByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getStakeholderPartnershipsByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_view_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getLocationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getActivitiesByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIUCNActionClassificationByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getFundingSourceByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_queries, 'getIndigenousPartnershipsByProjectSQL').returns(SQL`some`);
    sinon.stub(project_view_update_queries, 'getStakeholderPartnershipsByProjectSQL').returns(null);

    try {
      const result = view.getProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });
});
