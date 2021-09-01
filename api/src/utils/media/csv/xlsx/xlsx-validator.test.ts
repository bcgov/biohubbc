import { expect } from 'chai';
import { describe } from 'mocha';
import { XLSX_CLASS } from '../csv-file';
import {
  getCodeValuesByHeader,
  getRecommendedHeaders,
  getRequiredFieldsByHeader,
  getRequiredHeaders,
  getValidFormatsByHeader,
  getValidHeaders,
  getValidRangeFieldsByHeader
} from './xlsx-validator';

describe('getValidHeaders', () => {
  it('returns the valid headers when xlsx class is Sample Station Information', () => {
    const result = getValidHeaders(XLSX_CLASS.SAMPLE_STATION_INFORMATION);

    expect(result).to.eql([
      'Study Area Name',
      'Study Area Photos',
      'Sample Station Label',
      'UTM Zone Sample Station',
      'Easting Sample Station',
      'Northing Sample Station',
      'Sample Station Comments',
      'Sample Station Photos',
      'Additional Predefined Sample Station Fields',
      'Nesting Habitat Rating',
      'Nesting Habitat Rating Modifier',
      'Design Type Given'
    ]);
  });

  it('returns the valid headers when xlsx class is General Survey', () => {
    const result = getValidHeaders(XLSX_CLASS.GENERAL_SURVEY);

    expect(result).to.eql([
      'Study Area Name',
      'Sample Station Label',
      'Date',
      'Time',
      'End Time',
      'Additional Predefined Sample Station VIsit Fields',
      'Predefined Sampling Condition Fields',
      'Surveyor',
      'Species',
      'Count',
      'Survey Observation Photos',
      'Animal ID',
      'UTM Zone',
      'Easting',
      'Northing',
      'Comments',
      'Inventory Method',
      'Spatial Accuracy (m)',
      'Detect Type',
      'Detect Direction (deg)',
      'Detect DistaNorth Coaste (m)',
      'Temporary Animal ID',
      'Life Stage',
      'Sex',
      'Behaviour',
      'Feature Type',
      'Feature Label',
      'Feature Count',
      'Sign Type',
      'Sign or Sample Age',
      'Sign Count',
      'Group Label',
      'Adult Males',
      'Adult Females',
      'Adults - Unclassified Sex',
      'Juvenile Males',
      'Juvenile Females',
      'Juveniles - Unclassified Sex',
      'Males - Unclassified Life Stage',
      'Females - Unclassified Life Stage',
      'Unclassified Life Stage and Sex',
      'Eggs',
      'Egg Masses',
      'Larvae',
      'Pupae',
      'Hatchlings',
      'Fledglings',
      'Current Precipitation',
      'Wind Speed',
      'Sampling Condition Type',
      'Juvenile - On Nest - Unclassified Sex',
      'Juvenile - Fledged - Unclassified Sex',
      'Nest Newly Dicovered/Previously Known',
      'Nest Condition',
      'Nest Status',
      'Nest Tree Species',
      'Nest Tree DBH ',
      'Nest Elevation',
      'Nest Height estimate',
      'Nest Tree Height estimate',
      'Sign Voucher collected',
      'Sign Photos'
    ]);
  });

  it('returns the valid headers when xlsx class is Site & Incidental Observations', () => {
    const result = getValidHeaders(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS);

    expect(result).to.eql([
      'Site Study Area Name',
      'Site Sample Station Label',
      'Observer First Name',
      'Observer Last Name',
      'Info About Observer',
      'Location',
      'Site UTM Zone',
      'Site Easting',
      'Site Northing',
      'Spatial Accuracy (m)',
      'Habitat Description',
      'Site Description Photos',
      'Site Comments',
      'Additional Predefined Site Description Fields',
      'Species',
      'Date & Time',
      'Activity',
      'Sign Type',
      'Actv Count',
      'Adult Males',
      'Adult Females',
      'Adults - Unclassified Sex',
      'Juvenile Males',
      'Juvenile Females',
      'Juveniles - Unclassified Sex',
      'Unclassified Life Stage and Sex',
      'Eggs',
      'Egg Masses',
      'Larvae',
      'Pupae',
      'Vegetation Layer',
      'Percent Cover by Species',
      'Area (sq m)',
      'Plants',
      'Comments',
      'Incidental Observation Photos',
      'Additional Predefined IO Fields',
      'Time'
    ]);
  });

  it('returns no headers when xlsx class is not from known list', () => {
    const result = getValidHeaders('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});

describe('getRequiredHeaders', () => {
  it('returns the required headers when xlsx class is Sample Station Information', () => {
    const result = getRequiredHeaders(XLSX_CLASS.SAMPLE_STATION_INFORMATION);

    expect(result).to.eql([
      'Study Area Name',
      'Sample Station Label',
      'UTM Zone Sample Station',
      'Easting Sample Station',
      'Northing Sample Station'
    ]);
  });

  it('returns the required headers when xlsx class is General Survey', () => {
    const result = getRequiredHeaders(XLSX_CLASS.GENERAL_SURVEY);

    expect(result).to.eql([
      'Study Area Name',
      'Sample Station Label',
      'Date',
      'Time',
      'Surveyor',
      'Species',
      'UTM Zone',
      'Easting',
      'Northing'
    ]);
  });

  it('returns the required headers when xlsx class is Site & Incidental Observations', () => {
    const result = getRequiredHeaders(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS);

    expect(result).to.eql([
      'Site Study Area Name',
      'Site Sample Station Label',
      'Observer First Name',
      'Observer Last Name',
      'Site UTM Zone',
      'Site Easting',
      'Site Northing',
      'Species'
    ]);
  });

  it('returns no headers when xlsx class is not from known list', () => {
    const result = getRequiredHeaders('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});

describe('getRecommendedHeaders', () => {
  it('returns the recommended headers when xlsx class is Sample Station Information', () => {
    const result = getRecommendedHeaders(XLSX_CLASS.SAMPLE_STATION_INFORMATION);

    expect(result).to.eql(['Design Type Given']);
  });

  it('returns the recommended headers when xlsx class is Site & Incidental Observations', () => {
    const result = getRecommendedHeaders(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS);

    expect(result).to.eql(['Date & Time']);
  });

  it('returns no headers when xlsx class is not from known list', () => {
    const result = getRecommendedHeaders('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});

describe('getRequiredFieldsByHeader', () => {
  it('returns the required fields when xlsx class is Sample Station Information', () => {
    const result = getRequiredFieldsByHeader(XLSX_CLASS.SAMPLE_STATION_INFORMATION);

    expect(result).to.eql([
      'Study Area Name',
      'Sample Station Label',
      'UTM Zone Sample Station',
      'Easting Sample Station',
      'Northing Sample Station',
      'Design Type Given'
    ]);
  });

  it('returns the required fields when xlsx class is General Survey', () => {
    const result = getRequiredFieldsByHeader(XLSX_CLASS.GENERAL_SURVEY);

    expect(result).to.eql([
      'Study Area Name',
      'Sample Station Label',
      'Date',
      'Time',
      'Surveyor',
      'Species',
      'UTM Zone',
      'Easting',
      'Northing'
    ]);
  });

  it('returns the required fields when xlsx class is Site & Incidental Observations', () => {
    const result = getRequiredFieldsByHeader(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS);

    expect(result).to.eql([
      'Site Study Area Name',
      'Site Sample Station Label',
      'Observer First Name',
      'Observer Last Name',
      'Site UTM Zone',
      'Site Easting',
      'Site Northing',
      'Species',
      'Date & Time'
    ]);
  });

  it('returns no fields when xlsx class is not from known list', () => {
    const result = getRequiredFieldsByHeader('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});

describe('getCodeValuesByHeader', () => {
  it('returns no code values regardless of xlsx class', () => {
    const result = getCodeValuesByHeader(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS);

    expect(result).to.eql([]);
  });
});

describe('getValidRangeFieldsByHeader', () => {
  it('returns valid range fields when xlsx class is General Survey', () => {
    const result = getValidRangeFieldsByHeader(XLSX_CLASS.GENERAL_SURVEY);

    expect(result).to.eql([{ header: 'UTM Zone', min_value: 8, max_value: 11 }]);
  });

  it('returns no fields when xlsx class is not from known list', () => {
    const result = getValidRangeFieldsByHeader('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});

describe('getValidFormatsByHeader', () => {
  it('returns valid formats for header when xlsx class is General Survey', () => {
    const result = getValidFormatsByHeader(XLSX_CLASS.GENERAL_SURVEY);

    expect(result).to.eql([{ header: 'eventID', reg_exp: '^Kispiox.*', expected_format: 'Must start wth `Kispiox`' }]);
  });

  it('returns no format for header when xlsx class is not from known list', () => {
    const result = getValidFormatsByHeader('incorrect' as XLSX_CLASS);

    expect(result).to.eql([]);
  });
});
