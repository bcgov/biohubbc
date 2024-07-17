import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetAttachmentsData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetReportAttachmentsData,
  ProjectData
} from './project-view';

describe('ProjectData', () => {
  describe('No values provided', () => {
    let data: ProjectData;

    before(() => {
      data = {
        project_id: 1,
        uuid: 'uuid',
        project_name: '',
        comments: '',
        revision_count: 1
      };
    });

    it('sets id', () => {
      expect(data.project_id).to.equal(1);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });
  });

  describe('all values provided', () => {
    const projectData = {
      project_id: 1,
      name: 'project name',
      pt_id: 4,
      start_date: new Date('2020-04-20T07:00:00.000Z'),
      end_date: new Date('2020-05-20T07:00:00.000Z'),
      revision_count: 1
    };

    let data: ProjectData;

    before(() => {
      data = {
        project_id: 1,
        uuid: 'uuid',
        project_name: 'project name',
        comments: '',
        revision_count: 1
      };
    });

    it('sets id', () => {
      expect(data.project_id).to.equal(projectData.project_id);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
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

describe('GetIUCNClassificationData', () => {
  describe('No values provided', () => {
    let iucnClassificationData: GetIUCNClassificationData;

    before(() => {
      iucnClassificationData = new GetIUCNClassificationData(null as unknown as any[]);
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

describe('GetAttachmentsData', () => {
  describe('No values provided', () => {
    let data: GetAttachmentsData;

    before(() => {
      data = new GetAttachmentsData(null as unknown as any[]);
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
      const data: GetReportAttachmentsData = new GetReportAttachmentsData(null as unknown as any[]);

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
