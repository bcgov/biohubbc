import { expect } from 'chai';
import { COMPLETION_STATUS } from '../constants/status';
import { describe } from 'mocha';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData
} from './project-view';

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

    const indigenous_partnerships = [{ fn_name: 'partner 1' }, { fn_name: 'partner 2' }];
    const stakeholder_partnerships: string[] = [];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql(['partner 1', 'partner 2']);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('stakeholder_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships: string[] = [];
    const stakeholder_partnerships = [{ sp_name: 'partner 1' }, { sp_name: 'partner 2' }];

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

    const indigenous_partnerships = [{ fn_name: 'partner 1' }, { fn_name: 'partner 2' }];
    const stakeholder_partnerships = [{ sp_name: 'partner 3' }, { sp_name: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql(['partner 1', 'partner 2']);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 3', 'partner 4']);
    });
  });
});

describe('GetIUCNClassificationData', () => {
  describe('No values provided', () => {
    let iucnClassificationData: GetIUCNClassificationData;

    before(() => {
      iucnClassificationData = new GetIUCNClassificationData((null as unknown) as any[]);
    });

    it('sets classification details', function () {
      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('Empty array as values provided', () => {
    let iucnClassificationData: GetIUCNClassificationData;

    before(() => {
      iucnClassificationData = new GetIUCNClassificationData([]);
    });

    it('sets classification details', function () {
      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let iucnClassificationData: GetIUCNClassificationData;

    const iucnClassificationDataObj = [
      {
        classification: 'class',
        subclassification1: 'subclass1',
        subclassification2: 'subclass2'
      }
    ];

    before(() => {
      iucnClassificationData = new GetIUCNClassificationData(iucnClassificationDataObj);
    });

    it('sets classification details', function () {
      expect(iucnClassificationData.classificationDetails).to.eql([
        {
          classification: 'class',
          subClassification1: 'subclass1',
          subClassification2: 'subclass2'
        }
      ]);
    });
  });
});

describe('GetObjectivesData', () => {
  describe('No values provided', () => {
    let projectObjectivesData: GetObjectivesData;

    before(() => {
      projectObjectivesData = new GetObjectivesData(null);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal('');
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal('');
    });
  });

  describe('All values provided', () => {
    let projectObjectivesData: GetObjectivesData;

    const obj = {
      objectives: 'these are the project objectives',
      caveats: 'these are some interesting caveats'
    };

    before(() => {
      projectObjectivesData = new GetObjectivesData(obj);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal(obj.objectives);
    });

    it('sets caveats', function () {
      expect(projectObjectivesData.caveats).to.equal(obj.caveats);
    });
  });
});

describe('GetCoordinatorData', () => {
  describe('No values provided', () => {
    let projectCoordinatorData: GetCoordinatorData;

    before(() => {
      projectCoordinatorData = new GetCoordinatorData(null);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.equal('');
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.equal('');
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.equal('');
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.equal('');
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.equal('false');
    });
  });

  describe('All values provided', () => {
    let projectCoordinatorData: GetCoordinatorData;

    const obj = {
      coordinator_first_name: 'first',
      coordinator_last_name: 'last',
      coordinator_email_address: 'email@example.com',
      coordinator_agency_name: 'agency',
      coordinator_public: true
    };

    before(() => {
      projectCoordinatorData = new GetCoordinatorData(obj);
    });

    it('sets first_name', function () {
      expect(projectCoordinatorData.first_name).to.equal(obj.coordinator_first_name);
    });

    it('sets last_name', function () {
      expect(projectCoordinatorData.last_name).to.equal(obj.coordinator_last_name);
    });

    it('sets email_address', function () {
      expect(projectCoordinatorData.email_address).to.equal(obj.coordinator_email_address);
    });

    it('sets coordinator_agency', function () {
      expect(projectCoordinatorData.coordinator_agency).to.equal(obj.coordinator_agency_name);
    });

    it('sets share_contact_details', function () {
      expect(projectCoordinatorData.share_contact_details).to.equal('true');
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
  });

  describe('Empty array values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData([]);
    });

    it('sets location_description', function () {
      expect(locationData.location_description).to.equal('');
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql([]);
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

    const locationDataObj = [
      {
        location_description,
        geometry
      },
      {
        location_description,
        geometry
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

    it('sets completion_status', () => {
      expect(data.completion_status).to.equal(COMPLETION_STATUS.ACTIVE);
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      type: 4,
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
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets type', () => {
      expect(data.project_type).to.equal(projectData.type);
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

    it('sets completion_status', () => {
      expect(data.completion_status).to.equal(COMPLETION_STATUS.COMPLETED);
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
