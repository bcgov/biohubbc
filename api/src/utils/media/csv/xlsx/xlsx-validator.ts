import { MediaValidator } from '../../media-file';
import { getFileEmptyValidator, getFileMimeTypeValidator } from '../../validation/file-type-and-content-validator';
import { CSVValidator, XLSX_CLASS } from '../csv-file';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRequiredHeadersValidator
} from '../validation/csv-header-validator';
import {
  getCodeValueFieldsValidator,
  getRequiredFieldsValidator,
  ICodeValuesByHeader
} from '../validation/csv-row-validator';

export const getValidHeaders = (xlsxClass: XLSX_CLASS): string[] => {
  switch (xlsxClass) {
    case XLSX_CLASS.SAMPLE_STATION_INFORMATION:
      return [
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
      ];
    case XLSX_CLASS.GENERAL_SURVEY:
      return [
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
      ];
    case XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
      return [
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
      ];
    default:
      return [];
  }
};

export const getRequiredHeaders = (xlsxClass: XLSX_CLASS): string[] => {
  switch (xlsxClass) {
    case XLSX_CLASS.SAMPLE_STATION_INFORMATION:
      return [
        'Study Area Name',
        'Sample Station Label',
        'UTM Zone Sample Station',
        'Easting Sample Station',
        'Northing Sample Station',
        'Design Type Given'
      ];
    case XLSX_CLASS.GENERAL_SURVEY:
      return [
        'Study Area Name',
        'Sample Station Label',
        'Date',
        'Time',
        'Surveyor',
        'Species',
        'UTM Zone',
        'Easting',
        'Northing'
      ];
    case XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
      return [
        'Site Study Area Name',
        'Site Sample Station Label',
        'Observer First Name',
        'Observer Last Name',
        'Site UTM Zone',
        'Site Easting',
        'Site Northing',
        'Species',
        'Date & Time'
      ];
    default:
      return [];
  }
};

export const getRequiredFieldsByHeader = (xlsxClass: XLSX_CLASS): string[] => {
  switch (xlsxClass) {
    case XLSX_CLASS.SAMPLE_STATION_INFORMATION:
      return [
        'Study Area Name',
        'Sample Station Label',
        'UTM Zone Sample Station',
        'Easting Sample Station',
        'Northing Sample Station',
        'Design Type Given'
      ];
    case XLSX_CLASS.GENERAL_SURVEY:
      return [
        'Study Area Name',
        'Sample Station Label',
        'Date',
        'Time',
        'Surveyor',
        'Species',
        'UTM Zone',
        'Easting',
        'Northing'
      ];
    case XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
      return [
        'Site Study Area Name',
        'Site Sample Station Label',
        'Observer First Name',
        'Observer Last Name',
        'Site UTM Zone',
        'Site Easting',
        'Site Northing',
        'Species',
        'Date & Time'
      ];
    default:
      return [];
  }
};

export const getCodeValuesByHeader = (xlsxClass: XLSX_CLASS): ICodeValuesByHeader[] => {
  switch (xlsxClass) {
    default:
      return [];
  }
};

export const getXLSXCSVValidators = (xlsxClass: XLSX_CLASS): CSVValidator[] => {
  return [
    getDuplicateHeadersValidator(),
    hasRequiredHeadersValidator(getRequiredHeaders(xlsxClass)),
    getValidHeadersValidator(getValidHeaders(xlsxClass)),
    getRequiredFieldsValidator(getRequiredFieldsByHeader(xlsxClass)),
    getCodeValueFieldsValidator(getCodeValuesByHeader(xlsxClass))
  ];
};

/**
 * Get media validation rules for a given XLSX class.
 *
 * @return {*}  {MediaValidator[]}
 */
export const getXLSXMediaValidators = (): MediaValidator[] => {
  return [
    getFileEmptyValidator(),
    getFileMimeTypeValidator([
      /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/,
      /application\/vnd\.ms-excel/,
      /application\/vnd\\.openxmlformats/
    ])
  ];
};
