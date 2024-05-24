import { expect } from 'chai';
import { describe } from 'mocha';
import { IPermitModel } from '../repositories/permit-repository';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from './survey-view';

describe('GetSurveyData', () => {
  describe('No values provided', () => {
    let data: GetSurveyData;

    before(() => {
      data = new GetSurveyData(null);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyData;

    const obj = {
      name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      geojson: [{ data: 'data' }],
      revision_count: 'count'
    };

    before(() => {
      data = new GetSurveyData(obj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(obj.name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(obj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(obj.start_date);
    });

    it('sets revision_count', function () {
      expect(data.revision_count).to.equal('count');
    });
  });
});

describe('GetFocalSpeciesData', () => {
  describe('No values provided', () => {
    let data: GetFocalSpeciesData;

    before(() => {
      data = new GetFocalSpeciesData();
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetFocalSpeciesData;

    const obj = [
      { tsn: 1, commonNames: ['species1'] },
      { tsn: 2, commonNames: ['species2'] }
    ];

    before(() => {
      data = new GetFocalSpeciesData(obj);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([
        { tsn: 1, commonNames: ['species1'] },
        { tsn: 2, commonNames: ['species2'] }
      ]);
    });
  });
});

describe('GetAncillarySpeciesData', () => {
  describe('No values provided', () => {
    let data: GetAncillarySpeciesData;

    before(() => {
      data = new GetAncillarySpeciesData();
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetAncillarySpeciesData;

    const obj = [
      { tsn: 1, commonNames: ['species1'] },
      { tsn: 2, commonNames: ['species2'] }
    ];

    before(() => {
      data = new GetAncillarySpeciesData(obj);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([
        { tsn: 1, commonNames: ['species1'] },
        { tsn: 2, commonNames: ['species2'] }
      ]);
    });
  });
});

describe('GetPermitData', () => {
  describe('No values provided', () => {
    let data: GetPermitData;

    before(() => {
      data = new GetPermitData(undefined);
    });

    it('sets permits', () => {
      expect(data.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetPermitData;

    const obj = [
      {
        permit_id: 1,
        number: '12345',
        type: 'permit_type'
      }
    ] as IPermitModel[];

    before(() => {
      data = new GetPermitData(obj);
    });

    it('sets permit_id', () => {
      expect(data.permits[0].permit_id).to.equal(obj[0].permit_id);
    });

    it('sets permit_number', () => {
      expect(data.permits[0].permit_number).to.equal(obj[0].number);
    });

    it('sets permit_type', () => {
      expect(data.permits[0].permit_type).to.equal(obj[0].type);
    });
  });
});

describe('GetSurveyProprietorData', () => {
  describe('No values provided', () => {
    let data: GetSurveyProprietorData;

    before(() => {
      data = new GetSurveyProprietorData(null);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(null);
    });

    it('sets proprietor_type_id', () => {
      expect(data.proprietor_type_id).to.equal(null);
    });

    it('sets first_nations_id', () => {
      expect(data.first_nations_id).to.equal(null);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(null);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(null);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(null);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(false);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyProprietorData;

    const obj = {
      proprietor_type_name: 'proprietor_type_name',
      proprietor_type_id: 1,
      proprietary_data_category: 'survey name',
      first_nations_id: '2020/04/04',
      first_nations_name: 'first_nations_name',
      category_rationale: '2020/03/03',
      proprietor_name: 'proprietor_name',
      disa_required: true
    };

    before(() => {
      data = new GetSurveyProprietorData(obj);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(obj.proprietor_type_name);
    });

    it('sets proprietor_type_id', () => {
      expect(data.proprietor_type_id).to.equal(obj.proprietor_type_id);
    });

    it('sets first_nations_id', () => {
      expect(data.first_nations_id).to.equal(obj.first_nations_id);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(obj.first_nations_name);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(obj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(obj.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(obj.disa_required);
    });
  });
});

describe('GetSurveyLocationData', () => {
  describe('No values provided', () => {
    let data: GetSurveyLocationData;

    before(() => {
      data = new GetSurveyLocationData(null);
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets description', () => {
      expect(data.description).to.equal(null);
    });

    it('sets geojson', () => {
      expect(data.geojson).to.eql([]);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyLocationData;

    const obj = {
      name: 'area name',
      description: 'area description',
      geojson: []
    };

    before(() => {
      data = new GetSurveyLocationData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal(obj.name);
    });

    it('sets description', () => {
      expect(data.description).to.equal(obj.description);
    });

    it('sets geojson', () => {
      expect(data.geojson).to.eql(obj.geojson);
    });
  });
});

describe('GetSurveyPurposeAndMethodologyData', () => {
  describe('No values provided', () => {
    let data: GetSurveyPurposeAndMethodologyData;

    before(() => {
      data = new GetSurveyPurposeAndMethodologyData(null);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_ids).to.eql([]);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.equal('');
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql([]);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyPurposeAndMethodologyData;

    const obj = {
      intended_outcome_ids: [1],
      additional_details: 'additional_detail',
      vantage_ids: [4, 5],
      revision_count: 'count'
    };

    before(() => {
      data = new GetSurveyPurposeAndMethodologyData(obj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_ids).to.equal(obj.intended_outcome_ids);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.eql(obj.additional_details);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql(obj.vantage_ids);
    });

    it('sets revision_count', function () {
      expect(data.revision_count).to.equal('count');
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
