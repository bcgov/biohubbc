import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as view from './view';
import * as db from '../../../../database/db';
import public_queries from '../../../../queries/public';
import { getMockDBConnection } from '../../../../__mocks__/db';
import SQL from 'sql-template-strings';
import {
  GetIUCNClassificationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetLocationData,
  GetPermitData
} from '../../../../models/project-view';
import { GetPublicProjectData, GetPublicCoordinatorData } from '../../../../models/public/project';
import { GetFundingData } from '../../../../models/project-view-update';
import { HTTPError } from '../../../../errors/custom-error';

chai.use(sinonChai);

describe('getPublicProjectForView', () => {
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

  it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();
      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getPublicProjectPermitsSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getLocationByPublicProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getActivitiesByPublicProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getIUCNActionClassificationByPublicProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getFundingSourceByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getFundingSourceByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getIndigenousPartnershipsByPublicProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getFundingSourceByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIndigenousPartnershipsByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no sql statement returned for getStakeholderPartnershipsByProjectSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getFundingSourceByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIndigenousPartnershipsByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getStakeholderPartnershipsByPublicProjectSQL').returns(null);

    try {
      const result = view.getPublicProjectForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return id and nulls when all fields return null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getFundingSourceByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIndigenousPartnershipsByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getStakeholderPartnershipsByPublicProjectSQL').returns(SQL`some`);

    const result = view.getPublicProjectForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 1,
      project: null,
      permit: null,
      coordinator: null,
      objectives: null,
      location: null,
      iucn: null,
      funding: null,
      partnerships: null
    });
  });

  it('should return proper result for project info on success', async () => {
    const mockQuery = sinon.stub();

    const projectData = {
      id: 1,
      type: 'type',
      name: 'name',
      objectives: 'project objectives',
      location_description: 'location description',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      caveats: 'caveats',
      comments: 'comment',
      coordinator_first_name: 'first',
      coordinator_last_name: 'last',
      coordinator_email_address: 'coord@email.com',
      coordinator_agency_name: 'agency 1',
      coordinator_public: true,
      geometry: null,
      create_date: '2020/04/04',
      create_user: null,
      update_date: null,
      update_user: null,
      revision_count: 1,
      publish_date: null
    };

    const permitData = {
      number: 10,
      type: 'Scientific'
    };

    const locationData = {
      location_description: 'location description',
      geometry: null,
      revision_count: 1
    };

    const activityData = {
      activity_id: 19
    };

    const iucnData = {
      classification: 'class',
      subClassification1: 'subclass 1',
      subClassification2: 'subclass 2'
    };

    const fundingSourceData = {
      id: 1,
      agency_id: 2,
      funding_amount: 20,
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      investment_action_category: 2,
      investment_action_category_name: 'iac name',
      agency_name: 'agency name',
      agency_project_id: 1,
      revision_count: 1
    };

    const indigenousData = {
      fn_name: 'fn name'
    };

    const stakeholderData = {
      sp_name: 'sp name'
    };

    // getProjectSQL mock
    mockQuery.onCall(0).resolves({
      rows: [projectData]
    });

    // getProjectPermitsSQL mock
    mockQuery.onCall(1).resolves({
      rows: [permitData]
    });

    // getLocationByProjectSQL mock
    mockQuery.onCall(2).resolves({
      rows: [locationData]
    });

    // getActivitiesByProjectSQL mock
    mockQuery.onCall(3).resolves({
      rows: [activityData]
    });

    // getIUCNActionClassificationByProjectSQL mock
    mockQuery.onCall(4).resolves({
      rows: [iucnData]
    });

    // getFundingSourceByProjectSQL mock
    mockQuery.onCall(5).resolves({
      rows: [fundingSourceData]
    });

    // getIndigenousPartnershipsByProjectSQL mock
    mockQuery.onCall(6).resolves({
      rows: [indigenousData]
    });

    // getStakeholderPartnershipsByProjectSQL mock
    mockQuery.onCall(7).resolves({
      rows: [stakeholderData]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(public_queries, 'getPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getPublicProjectPermitsSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getLocationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getActivitiesByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIUCNActionClassificationByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getFundingSourceByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getIndigenousPartnershipsByPublicProjectSQL').returns(SQL`some`);
    sinon.stub(public_queries, 'getStakeholderPartnershipsByPublicProjectSQL').returns(SQL`some`);

    const result = view.getPublicProjectForView();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 1,
      project: new GetPublicProjectData(projectData, [activityData]),
      permit: new GetPermitData([permitData]),
      coordinator: new GetPublicCoordinatorData(projectData),
      objectives: new GetObjectivesData(projectData),
      location: new GetLocationData([locationData]),
      iucn: new GetIUCNClassificationData([iucnData]),
      funding: new GetFundingData([fundingSourceData]),
      partnerships: new GetPartnershipsData([indigenousData], [stakeholderData])
    });
  });
});
