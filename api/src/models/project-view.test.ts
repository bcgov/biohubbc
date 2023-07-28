import { expect } from 'chai';
import { describe } from 'mocha';
import { COMPLETION_STATUS } from '../constants/status';
import {
  GetAttachmentsData,
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData,
  GetReportAttachmentsData
} from './project-view';

describe('GetProjectData', () => {
  describe('No values provided', () => {
    let data: GetProjectData;

    before(() => {
      data = new GetProjectData();
    });

    it('sets id', () => {
      expect(data.id).to.equal(null);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets type', () => {
      expect(data.project_type).to.equal(-1);
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
      project_id: 1,
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

    it('sets id', () => {
      expect(data.id).to.equal(projectData.project_id);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets type', () => {
      expect(data.project_type).to.equal(projectData.pt_id);
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

describe('GetObjectivesData', () => {
  describe('No values provided', () => {
    let projectObjectivesData: GetObjectivesData;

    before(() => {
      projectObjectivesData = new GetObjectivesData(null);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal('');
    });
  });

  describe('All values provided', () => {
    let projectObjectivesData: GetObjectivesData;

    const obj = {
      objectives: 'these are the project objectives',
      revision_count: 'revision'
    };

    before(() => {
      projectObjectivesData = new GetObjectivesData(obj);
    });

    it('sets objectives', function () {
      expect(projectObjectivesData.objectives).to.equal(obj.objectives);
    });

    it('sets revision_count', function () {
      expect(projectObjectivesData.revision_count).to.equal(obj.revision_count);
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
      coordinator_public: true,
      revision_count: 'count'
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

    it('sets revision_count', function () {
      expect(projectCoordinatorData.revision_count).to.equal('count');
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
        geometry,
        revision_count: 'count'
      },
      {
        location_description,
        geometry,
        revision_count: 'count'
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

    it('sets revision_count', function () {
      expect(locationData.revision_count).to.equal('count');
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

describe('GetFundingData', () => {
  describe('No values provided', () => {
    let projectFundingData: GetFundingData;

    before(() => {
      projectFundingData = new GetFundingData((null as unknown) as any[]);
    });

    it('sets funding sources', function () {
      expect(projectFundingData.fundingSources).to.eql([]);
    });
  });

  describe('Empty array as values provided', () => {
    let projectFundingData: GetFundingData;

    before(() => {
      projectFundingData = new GetFundingData([]);
    });

    it('sets funding sources', function () {
      expect(projectFundingData.fundingSources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectFundingData: GetFundingData;

    const fundings = [
      {
        id: 1,
        agency_id: 2,
        investment_action_category: 3,
        investment_action_category_name: 'Something',
        agency_name: 'fake',
        funding_amount: 123456,
        start_date: Date.now().toString(),
        end_date: Date.now().toString(),
        agency_project_id: '12',
        revision_count: 1,
        first_nations_name: null,
        first_nations_id: null
      }
    ];

    before(() => {
      projectFundingData = new GetFundingData(fundings);
    });

    it('sets funding sources', function () {
      expect(projectFundingData.fundingSources).to.eql(fundings);
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

    const indigenous_partnerships: number[] = [];
    const stakeholder_partnerships = [{ partnership_name: 'partner 1' }, { partnership_name: 'partner 2' }];

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
    const stakeholder_partnerships = [{ partnership_name: 'partner 3' }, { partnership_name: 'partner 4' }];

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

describe('GetAttachmentsData', () => {
  describe('No values provided', () => {
    let data: GetAttachmentsData;

    before(() => {
      data = new GetAttachmentsData((null as unknown) as any[]);
    });

    it('sets attachmentDetails', function () {
      expect(data.attachmentDetails).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    let data: GetAttachmentsData;

    before(() => {
      data = new GetAttachmentsData([]);
    });

    it('sets attachmentDetails', function () {
      expect(data.attachmentDetails).to.eql([]);
    });
  });

  describe('some attachmentDetails values provided', () => {
    let data: GetAttachmentsData;

    const attachmentDetails = [{ file_name: 1 }, { file_name: 2 }];

    before(() => {
      data = new GetAttachmentsData(attachmentDetails);
    });

    it('sets file_name', function () {
      expect(data.attachmentDetails).to.eql([
        {
          file_name: 1,
          file_type: undefined,
          title: undefined,
          description: undefined,
          key: undefined,
          file_size: undefined
        },
        {
          file_name: 2,
          file_type: undefined,
          title: undefined,
          description: undefined,
          key: undefined,
          file_size: undefined
        }
      ]);
    });
  });

  describe('all attachmentDetails values provided', () => {
    let data: GetAttachmentsData;

    const attachmentDetails = [
      {
        file_name: 1,
        file_type: 'type',
        title: 'title',
        description: 'descript',
        file_size: 'file_size',
        key: 'key'
      },
      {
        file_name: 2,
        file_type: 'type',
        title: 'title',
        description: 'descript',
        file_size: 'file_size',
        key: 'key'
      }
    ];

    before(() => {
      data = new GetAttachmentsData(attachmentDetails);
    });

    it('sets all fields', function () {
      expect(data.attachmentDetails).to.eql([
        {
          file_name: 1,
          file_type: 'type',
          title: 'title',
          description: 'descript',
          key: 'key',
          file_size: 'file_size'
        },
        {
          file_name: 2,
          file_type: 'type',
          title: 'title',
          description: 'descript',
          key: 'key',
          file_size: 'file_size'
        }
      ]);
    });
  });
});

describe('GetReportAttachmentsData', () => {
  describe('No values provided', () => {
    it('sets attachmentDetails', function () {
      const data: GetReportAttachmentsData = new GetReportAttachmentsData((null as unknown) as any[]);

      expect(data.attachmentDetails).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    it('sets attachmentDetails', function () {
      const data: GetReportAttachmentsData = new GetReportAttachmentsData([]);

      expect(data.attachmentDetails).to.eql([]);
    });
  });

  describe('some attachmentDetails asdasdsadsasd values provided', () => {
    it('sets file_name', function () {
      const attachmentDetails = [{ file_name: 1 }, { file_name: 2 }];

      const data: GetReportAttachmentsData = new GetReportAttachmentsData(attachmentDetails);
      expect(data.attachmentDetails).to.eql([
        {
          file_name: 1,
          title: undefined,
          year: undefined,
          description: undefined,
          key: undefined,
          file_size: undefined
        },
        {
          file_name: 2,
          title: undefined,
          year: undefined,
          description: undefined,
          key: undefined,
          file_size: undefined
        }
      ]);
    });
  });

  describe('all attachmentDetails values provided', () => {
    it('sets all fields', function () {
      const attachmentDetails = [
        {
          file_name: 1,
          title: 'title',
          year: '1',
          description: 'descript',
          file_size: 'size',
          key: 'key',
          authors: [{ author: 'author' }]
        },
        {
          file_name: 2,
          file_type: 'type',
          title: 'title',
          year: '2',
          description: 'descript',
          file_size: 'size',
          key: 'key',
          authors: [{ author: 'author' }]
        }
      ];
      const data: GetReportAttachmentsData = new GetReportAttachmentsData(attachmentDetails);

      expect(data.attachmentDetails).to.eql([
        {
          file_name: 1,
          title: 'title',
          year: '1',
          description: 'descript',
          key: 'key',
          file_size: 'size',
          authors: [{ author: 'author' }]
        },
        {
          file_name: 2,
          title: 'title',
          year: '2',
          description: 'descript',
          key: 'key',
          file_size: 'size',
          authors: [{ author: 'author' }]
        }
      ]);
    });
  });
});
