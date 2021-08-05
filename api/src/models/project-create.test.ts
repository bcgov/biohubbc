import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostIUCNData,
  PostLocationData,
  PostObjectivesData,
  PostCoordinatorData,
  PostPartnershipsData,
  PostPermitData,
  PostProjectData,
  PostFundingData,
  PostProjectObject,
  PostFundingSource
} from './project-create';

describe('PostProjectObject', () => {
  describe('No values provided', () => {
    let projectPostObject: PostProjectObject;

    before(() => {
      projectPostObject = new PostProjectObject(null);
    });

    it('sets coordinator', function () {
      expect(projectPostObject.coordinator).to.equal(null);
    });

    it('sets permit', function () {
      expect(projectPostObject.permit).to.equal(null);
    });

    it('sets project', function () {
      expect(projectPostObject.project).to.equal(null);
    });

    it('sets objectives', function () {
      expect(projectPostObject.objectives).to.equal(null);
    });

    it('sets location', function () {
      expect(projectPostObject.location).to.equal(null);
    });

    it('sets iucn', function () {
      expect(projectPostObject.iucn).to.equal(null);
    });

    it('sets funding', function () {
      expect(projectPostObject.funding).to.equal(null);
    });

    it('sets partnerships', function () {
      expect(projectPostObject.partnerships).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostObject: PostProjectObject;

    const obj = {
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true'
      },
      permit: {
        permits: [
          {
            permit_number: 1
          }
        ]
      },
      project: {
        project_name: 'name_test_data',
        project_type: 'test_type',
        project_activities: [1, 2],
        start_date: 'start_date_test_data',
        end_date: 'end_date_test_data',
        comments: 'comments_test_data'
      },
      objectives: {
        objectives: 'these are the project objectives',
        caveats: 'these are some interesting caveats'
      },
      location: {
        location_description: 'a location description',
        geometry: [
          {
            type: 'Polygon',
            coordinates: [
              [
                [-128, 55],
                [-128, 55.5],
                [-128, 56],
                [-126, 58],
                [-128, 55]
              ]
            ],
            properties: {
              name: 'Biohub Islands'
            }
          }
        ]
      },
      funding: {
        funding_sources: [
          {
            agency_id: 1,
            investment_action_category: 1,
            agency_project_id: 'agency project id',
            funding_amount: 12,
            start_date: '2020/04/03',
            end_date: '2020/05/05'
          }
        ]
      },
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 2,
            subClassification2: 3
          }
        ]
      },
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: ['partner1, partner2']
      }
    };

    before(() => {
      projectPostObject = new PostProjectObject(obj);
    });

    it('sets coordinator', function () {
      expect(projectPostObject.coordinator.first_name).to.equal(obj.coordinator.first_name);
    });
  });
});

describe('PostProjectData', () => {
  describe('No values provided', () => {
    let projectPostData: PostProjectData;

    before(() => {
      projectPostData = new PostProjectData(null);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal(null);
    });

    it('sets type', function () {
      expect(projectPostData.type).to.equal(null);
    });

    it('sets activities', function () {
      expect(projectPostData.project_activities).to.have.length(0);
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal(null);
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal(null);
    });

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectPostData: PostProjectData;

    const obj = {
      project_name: 'name_test_data',
      project_type: 'test_type',
      project_activities: [1, 2],
      start_date: 'start_date_test_data',
      end_date: 'end_date_test_data',
      comments: 'comments_test_data'
    };

    before(() => {
      projectPostData = new PostProjectData(obj);
    });

    it('sets name', function () {
      expect(projectPostData.name).to.equal('name_test_data');
    });

    it('sets type', function () {
      expect(projectPostData.type).to.equal('test_type');
    });

    it('sets activities', function () {
      expect(projectPostData.project_activities).to.eql([1, 2]);
    });

    it('sets start_date', function () {
      expect(projectPostData.start_date).to.equal('start_date_test_data');
    });

    it('sets end_date', function () {
      expect(projectPostData.end_date).to.equal('end_date_test_data');
    });

    it('sets comments', function () {
      expect(projectPostData.comments).to.equal('comments_test_data');
    });
  });
});

describe('PostObjectivesData', () => {
  describe('No values provided', () => {
    let projectObjectivesData: PostObjectivesData;

    before(() => {
      projectObjectivesData = new PostObjectivesData(null);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal('');
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal('');
    });
  });

  describe('All values provided', () => {
    let projectObjectivesData: PostObjectivesData;

    const obj = {
      objectives: 'these are the project objectives',
      caveats: 'these are some interesting caveats'
    };

    before(() => {
      projectObjectivesData = new PostObjectivesData(obj);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal(obj.caveats);
    });
  });
});

describe('PostPermitData', () => {
  describe('No values provided', () => {
    let projectPermitData: PostPermitData;

    before(() => {
      projectPermitData = new PostPermitData(null);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided are null', () => {
    let projectPermitData: PostPermitData;

    before(() => {
      projectPermitData = new PostPermitData({
        permits: null
      });
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided are empty arrays', () => {
    let projectPermitData: PostPermitData;

    before(() => {
      projectPermitData = new PostPermitData({
        permits: []
      });
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided with sampling conducted as true', () => {
    let projectPermitData: PostPermitData;

    const obj = {
      permits: [
        {
          permit_number: '1',
          permit_type: 'permit type'
        }
      ]
    };

    before(() => {
      projectPermitData = new PostPermitData(obj);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([
        {
          permit_number: '1',
          permit_type: 'permit type'
        }
      ]);
    });
  });

  describe('All values provided with sampling conducted as false', () => {
    let projectPermitData: PostPermitData;

    const obj = {
      permits: [
        {
          permit_number: '1',
          permit_type: 'permit type'
        }
      ]
    };

    before(() => {
      projectPermitData = new PostPermitData(obj);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([
        {
          permit_number: '1',
          permit_type: 'permit type'
        }
      ]);
    });
  });
});

describe('PostCoordinatorData', () => {
  describe('No values provided', () => {
    let projectCoordinatorData: PostCoordinatorData;

    before(() => {
      projectCoordinatorData = new PostCoordinatorData(null);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.eql(null);
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.eql(null);
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.eql(null);
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.eql(null);
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.eql(false);
    });
  });

  describe('All values provided', () => {
    let projectCoordinatorData: PostCoordinatorData;

    const obj = {
      first_name: 'first',
      last_name: 'last',
      email_address: 'email@example.com',
      coordinator_agency: 'agency',
      share_contact_details: 'true'
    };

    before(() => {
      projectCoordinatorData = new PostCoordinatorData(obj);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.eql(obj.first_name);
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.eql(obj.last_name);
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.eql(obj.email_address);
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.eql(obj.coordinator_agency);
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.eql(true);
    });
  });
});

describe('PostPartnershipsData', () => {
  describe('No values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(null);
    });

    it('sets indigenous_partnerships', function () {
      expect(projectPartnershipsData.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(projectPartnershipsData.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner1, partner2']
    };

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', function () {
      expect(projectPartnershipsData.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', function () {
      expect(projectPartnershipsData.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
    });
  });
});

describe('PostFundingSource', () => {
  describe('No values provided', () => {
    let projectFundingData: PostFundingSource;

    before(() => {
      projectFundingData = new PostFundingSource(null);
    });

    it('sets agency_id', () => {
      expect(projectFundingData.agency_id).to.equal(null);
    });

    it('sets investment_action_category', () => {
      expect(projectFundingData.investment_action_category).to.equal(null);
    });

    it('sets agency_project_id', () => {
      expect(projectFundingData.agency_project_id).to.equal(null);
    });

    it('sets funding_amount', () => {
      expect(projectFundingData.funding_amount).to.equal(null);
    });

    it('sets start_date', () => {
      expect(projectFundingData.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(projectFundingData.end_date).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let projectFundingData: PostFundingSource;

    const obj = {
      agency_id: 1,
      investment_action_category: 1,
      agency_project_id: 'agency project id',
      funding_amount: 20,
      start_date: '2020/04/04',
      end_date: '2020/05/05'
    };

    before(() => {
      projectFundingData = new PostFundingSource(obj);
    });

    it('sets agency_id', () => {
      expect(projectFundingData.agency_id).to.equal(obj.agency_id);
    });

    it('sets investment_action_category', () => {
      expect(projectFundingData.investment_action_category).to.equal(obj.investment_action_category);
    });

    it('sets agency_project_id', () => {
      expect(projectFundingData.agency_project_id).to.equal(obj.agency_project_id);
    });

    it('sets funding_amount', () => {
      expect(projectFundingData.funding_amount).to.equal(obj.funding_amount);
    });

    it('sets start_date', () => {
      expect(projectFundingData.start_date).to.equal(obj.start_date);
    });

    it('sets end_date', () => {
      expect(projectFundingData.end_date).to.equal(obj.end_date);
    });
  });
});

describe('PostIUCNData', () => {
  describe('No values provided', () => {
    let projectIUCNData: PostIUCNData;

    before(() => {
      projectIUCNData = new PostIUCNData(null);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectIUCNData: PostIUCNData;

    const obj = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 3
        }
      ]
    };

    before(() => {
      projectIUCNData = new PostIUCNData(obj);
    });

    it('sets classification details', function () {
      expect(projectIUCNData.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});

describe('PostLocationData', () => {
  describe('No values provided', () => {
    let projectLocationData: PostLocationData;

    before(() => {
      projectLocationData = new PostLocationData(null);
    });

    it('sets location_description', function () {
      expect(projectLocationData.location_description).to.equal(null);
    });

    it('sets geometry', function () {
      expect(projectLocationData.geometry).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectLocationData: PostLocationData;

    const obj = {
      location_description: 'a location description',
      geometry: [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          properties: {
            name: 'Biohub Islands'
          }
        }
      ]
    };

    before(() => {
      projectLocationData = new PostLocationData(obj);
    });

    it('sets location_description', function () {
      expect(projectLocationData.location_description).to.equal('a location description');
    });

    it('sets the geometry', function () {
      expect(projectLocationData.geometry).to.eql(obj.geometry);
    });
  });
});

describe('PostFundingData', () => {
  describe('No values provided', () => {
    let data: PostFundingData;

    before(() => {
      data = new PostFundingData(null);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('Values provided but not valid arrays', () => {
    let data: PostFundingData;

    const obj = {
      funding_sources: null
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('Values provided but with no length', () => {
    let data: PostFundingData;

    const obj = {
      funding_sources: []
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PostFundingData;

    const obj = {
      funding_sources: [
        {
          agency_id: 1,
          investment_action_category: 1,
          agency_project_id: 'agency project id',
          funding_amount: 12,
          start_date: '2020/04/03',
          end_date: '2020/05/05'
        }
      ]
    };

    before(() => {
      data = new PostFundingData(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql(obj.funding_sources);
    });
  });
});
