import { CSVValidator, ICsvState, XLSXCSV } from '../csv-file';
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

export enum SPI_CLASS {
  SAMPLE_STATION_INFORMATION = 'Sample Station Information',
  GENERAL_SURVEY = 'General Survey',
  SITE_INCIDENTAL_OBSERVATIONS = 'Site & Incidental Observations'
}

export const getValidHeaders = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.SAMPLE_STATION_INFORMATION:
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
    case SPI_CLASS.GENERAL_SURVEY:
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
    case SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
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

export const getRequiredHeaders = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.SAMPLE_STATION_INFORMATION:
      return [
        'Study Area Name',
        'Sample Station Label',
        'UTM Zone Sample Station',
        'Easting Sample Station',
        'Northing Sample Station',
        'Design Type Given'
      ];
    case SPI_CLASS.GENERAL_SURVEY:
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
    case SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
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

export const getRequiredFieldsByHeader = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.SAMPLE_STATION_INFORMATION:
      return [
        'Study Area Name',
        'Sample Station Label',
        'UTM Zone Sample Station',
        'Easting Sample Station',
        'Northing Sample Station',
        'Design Type Given'
      ];
    case SPI_CLASS.GENERAL_SURVEY:
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
    case SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
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

export const getCodeValuesByHeader = (dwcClass: SPI_CLASS): ICodeValuesByHeader[] => {
  switch (dwcClass) {
    default:
      return [];
  }
};

export function isSPITemplateValid(xlsxCSV: XLSXCSV): ICsvState[] {
  const responses: ICsvState[] = [];

  xlsxCSV?.workbook.worksheets[SPI_CLASS.SAMPLE_STATION_INFORMATION] &&
    responses.push(
      xlsxCSV?.workbook.worksheets[SPI_CLASS.SAMPLE_STATION_INFORMATION]
        .validate(getSPITemplateValidators(SPI_CLASS.SAMPLE_STATION_INFORMATION))
        .getState()
    );

  xlsxCSV?.workbook.worksheets[SPI_CLASS.GENERAL_SURVEY] &&
    responses.push(
      xlsxCSV?.workbook.worksheets[SPI_CLASS.GENERAL_SURVEY]
        .validate(getSPITemplateValidators(SPI_CLASS.GENERAL_SURVEY))
        .getState()
    );

  xlsxCSV?.workbook.worksheets[SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS] &&
    responses.push(
      xlsxCSV?.workbook.worksheets[SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS]
        .validate(getSPITemplateValidators(SPI_CLASS.SITE_INCIDENTAL_OBSERVATIONS))
        .getState()
    );

  return responses;
}

export const getSPITemplateValidators = (spiClass: SPI_CLASS): CSVValidator[] => {
  return [
    getDuplicateHeadersValidator(),
    hasRequiredHeadersValidator(getRequiredHeaders(spiClass)),
    getValidHeadersValidator(getValidHeaders(spiClass)),
    getRequiredFieldsValidator(getRequiredFieldsByHeader(spiClass)),
    getCodeValueFieldsValidator(getCodeValuesByHeader(spiClass))
  ];
};
