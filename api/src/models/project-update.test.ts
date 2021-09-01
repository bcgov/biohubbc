import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetCoordinatorData,
  GetPartnershipsData,
  GetObjectivesData,
  PutCoordinatorData,
  PutPartnershipsData,
  PutObjectivesData,
  GetLocationData,
  GetProjectData,
  PutProjectData,
  PutIUCNData,
  GetIUCNClassificationData,
  PutLocationData,
  PutFundingSource,
  GetPermitData
} from './project-update';

describe('PutLocationData', () => {
  describe('No values provided', () => {
    let data: PutLocationData;

    before(() => {
      data = new PutLocationData(null);
    });

    it('sets location_description', () => {
      expect(data.location_description).to.equal(null);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: PutLocationData;

    const obj = {
      location_description: 'location',
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
      ],
      revision_count: 1
    };

    before(() => {
      data = new PutLocationData(obj);
    });

    it('sets location_description', () => {
      expect(data.location_description).to.equal(obj.location_description);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(obj.geometry);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.eql(obj.revision_count);
    });
  });
});

describe('GetIUCNClassificationData', () => {
  describe('No values provided', () => {
    let data: GetIUCNClassificationData;

    before(() => {
      data = new GetIUCNClassificationData((null as unknown) as any[]);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    const obj = [
      {
        classification: 1,
        subclassification1: 2,
        subclassification2: 2
      }
    ];

    let data: GetIUCNClassificationData;

    before(() => {
      data = new GetIUCNClassificationData(obj);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql([
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 2
        }
      ]);
    });
  });
});

describe('PutIUCNData', () => {
  describe('No values provided', () => {
    let data: PutIUCNData;

    before(() => {
      data = new PutIUCNData(null);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    const obj = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 2
        }
      ]
    };

    let data: PutIUCNData;

    before(() => {
      data = new PutIUCNData(obj);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});

describe('PutPartnershipsData', () => {
  describe('No values provided', () => {
    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(null);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('all values provided', () => {
    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 3', 'partner 4']
    };

    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
    });
  });
});

describe('GetPartnershipsData', () => {
  describe('No values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData((null as unknown) as any[], (null as unknown) as any[]);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData([], []);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('indigenous_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ id: 1 }, { id: 2 }];
    const stakeholder_partnerships: string[] = [];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('stakeholder_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships: string[] = [];
    const stakeholder_partnerships = [{ name: 'partner 1' }, { name: 'partner 2' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 1', 'partner 2']);
    });
  });

  describe('All values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ id: 1 }, { id: 2 }];
    const stakeholder_partnerships = [{ name: 'partner 3' }, { name: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 3', 'partner 4']);
    });
  });
});

describe('GetCoordinatorData', () => {
  describe('No values provided', () => {
    let data: GetCoordinatorData;

    before(() => {
      data = new GetCoordinatorData(null);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal(null);
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal(null);
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal(null);
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal(null);
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal('false');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      coordinator_first_name: 'coordinator_first_name',
      coordinator_last_name: 'coordinator_last_name',
      coordinator_email_address: 'coordinator_email_address',
      coordinator_agency_name: 'coordinator_agency_name',
      coordinator_public: true,
      revision_count: 1
    };

    let data: GetCoordinatorData;

    before(() => {
      data = new GetCoordinatorData(obj);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal('coordinator_first_name');
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal('coordinator_last_name');
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal('coordinator_email_address');
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal('coordinator_agency_name');
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal('true');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutCoordinatorData', () => {
  describe('No values provided', () => {
    let data: PutCoordinatorData;

    before(() => {
      data = new PutCoordinatorData(null);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal(null);
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal(null);
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal(null);
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal(null);
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal(false);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      first_name: 'coordinator_first_name',
      last_name: 'coordinator_last_name',
      email_address: 'coordinator_email_address',
      coordinator_agency: 'coordinator_agency_name',
      share_contact_details: 'true',
      revision_count: 1
    };

    let data: PutCoordinatorData;

    before(() => {
      data = new PutCoordinatorData(obj);
    });

    it('sets first_name', () => {
      expect(data.first_name).to.equal('coordinator_first_name');
    });

    it('sets last_name', () => {
      expect(data.last_name).to.equal('coordinator_last_name');
    });

    it('sets email_address', () => {
      expect(data.email_address).to.equal('coordinator_email_address');
    });

    it('sets coordinator_agency', () => {
      expect(data.coordinator_agency).to.equal('coordinator_agency_name');
    });

    it('sets share_contact_details', () => {
      expect(data.share_contact_details).to.equal(true);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('GetPermitData', () => {
  describe('No values provided', () => {
    let projectPermitData: GetPermitData;

    before(() => {
      projectPermitData = new GetPermitData((null as unknown) as any[]);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPermitData: GetPermitData;

    const permits = [
      {
        number: '1',
        type: 'permit type'
      }
    ];

    before(() => {
      projectPermitData = new GetPermitData(permits);
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

describe('GetObjectivesData', () => {
  describe('No values provided', () => {
    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData(null);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal('');
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal('');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      objectives: 'objectives',
      caveats: 'caveats',
      revision_count: 1
    };

    let data: GetObjectivesData;

    before(() => {
      data = new GetObjectivesData(obj);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal(obj.caveats);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('PutObjectivesData', () => {
  describe('No values provided', () => {
    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData(null);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal('');
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal('');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      objectives: 'objectives',
      caveats: 'caveats',
      revision_count: 1
    };

    let data: PutObjectivesData;

    before(() => {
      data = new PutObjectivesData(obj);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', () => {
      expect(data.caveats).to.equal(obj.caveats);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('GetLocationData', () => {
  describe('No values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData(null);
    });

    it('sets location_description', function () {
      expect(locationData.location_description).to.equal('');
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql([]);
    });

    it('sets revision_count', () => {
      expect(locationData.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let locationData: GetLocationData;

    const location_description = 'location description';
    const geometry = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }
    ];
    const revision_count = 1;

    const locationDataObj = [
      {
        location_description,
        geometry,
        revision_count
      },
      {
        location_description,
        geometry,
        revision_count
      }
    ];

    before(() => {
      locationData = new GetLocationData(locationDataObj);
    });

    it('sets location_description', function () {
      expect(locationData.location_description).to.equal(location_description);
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql(geometry);
    });

    it('sets revision_count', () => {
      expect(locationData.revision_count).to.equal(revision_count);
    });
  });
});

describe('GetProjectData', () => {
  describe('No values provided', () => {
    let data: GetProjectData;

    before(() => {
      data = new GetProjectData();
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets type', () => {
      expect(data.project_type).to.equal('');
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql([]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      pt_id: 4,
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    const activityData = [{ activity_id: 1 }, { activity_id: 2 }];

    let data: GetProjectData;

    before(() => {
      data = new GetProjectData(projectData, activityData);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('project name');
    });

    it('sets type', () => {
      expect(data.project_type).to.equal(4);
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql([1, 2]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutProjectData', () => {
  describe('No values provided', () => {
    let data: PutProjectData;

    before(() => {
      data = new PutProjectData();
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets type', () => {
      expect(data.type).to.equal(null);
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql([]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      project_name: 'project name',
      project_type: 4,
      project_activities: [1, 2],
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: PutProjectData;

    before(() => {
      data = new PutProjectData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal('project name');
    });

    it('sets type', () => {
      expect(data.type).to.equal(4);
    });

    it('sets project_activities', () => {
      expect(data.project_activities).to.eql([1, 2]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutFundingSource', () => {
  describe('No values provided', () => {
    let data: PutFundingSource;

    before(() => {
      data = new PutFundingSource(null);
    });

    it('sets id', () => {
      expect(data.id).to.equal(null);
    });

    it('sets investment_action_category', () => {
      expect(data.investment_action_category).to.equal(null);
    });

    it('sets agency_project_id', () => {
      expect(data.agency_project_id).to.equal(null);
    });

    it('sets funding_amount', () => {
      expect(data.funding_amount).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PutFundingSource;

    before(() => {
      data = new PutFundingSource({
        fundingSources: [
          {
            id: 1,
            investment_action_category: 1,
            agency_project_id: 'agency project id',
            funding_amount: 20,
            start_date: '2020/04/04',
            end_date: '2020/05/05',
            revision_count: 1
          }
        ]
      });
    });

    it('sets id', () => {
      expect(data.id).to.equal(1);
    });

    it('sets investment_action_category', () => {
      expect(data.investment_action_category).to.equal(1);
    });

    it('sets agency_project_id', () => {
      expect(data.agency_project_id).to.equal('agency project id');
    });

    it('sets funding_amount', () => {
      expect(data.funding_amount).to.equal(20);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020/04/04');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020/05/05');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});
