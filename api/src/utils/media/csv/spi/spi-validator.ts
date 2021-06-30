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
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship'
}

export const getValidHeaders = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.EVENT:
      return [
        'eventID',
        'parentEventID',
        'eventDate',
        'samplingProtocol',
        'geodeticDatum',
        'verbatimCoordinates',
        'verbatimElevation',
        'coordinateUncertaintyInMeters',
        'coordinatePrecision',
        'verbatimLocality',
        'locationRemarks'
      ];
    case SPI_CLASS.OCCURRENCE:
      return [
        'eventID',
        'occurrenceID',
        'basisOfRecord',
        'type',
        'associatedTaxa',
        'sex',
        'lifeStage',
        'individualCount',
        'occurrenceRemarks',
        'identifiedBy'
      ];
    case SPI_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case SPI_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export const getRequiredHeaders = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.EVENT:
      return [
        'eventID',
        'parentEventID',
        'eventDate',
        'samplingProtocol',
        'geodeticDatum',
        'verbatimCoordinates',
        'verbatimElevation',
        'coordinateUncertaintyInMeters',
        'coordinatePrecision',
        'verbatimLocality',
        'locationRemarks'
      ];
    case SPI_CLASS.OCCURRENCE:
      return [
        'eventID',
        'occurrenceID',
        'basisOfRecord',
        'type',
        'associatedTaxa',
        'sex',
        'lifeStage',
        'individualCount',
        'identifiedBy'
      ];
    case SPI_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case SPI_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export const getRequiredFieldsByHeader = (spiClass: SPI_CLASS): string[] => {
  switch (spiClass) {
    case SPI_CLASS.EVENT:
      return ['eventID'];
    case SPI_CLASS.OCCURRENCE:
      return ['eventID', 'occurrenceID', 'basisOfRecord', 'type', 'associatedTaxa', 'individualCount', 'identifiedBy'];
    case SPI_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case SPI_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export const getCodeValuesByHeader = (dwcClass: SPI_CLASS): ICodeValuesByHeader[] => {
  switch (dwcClass) {
    case SPI_CLASS.OCCURRENCE:
      return [
        { header: 'sex', codeValues: ['male', 'female'] },
        { header: 'lifeStage', codeValues: ['adult', 'yearling', 'juvenile', 'hatchling'] }
      ];
    default:
      return [];
  }
};

export function isSPITemplateValid(xlsxCSV: XLSXCSV): ICsvState[] {
  const responses: ICsvState[] = [];

  xlsxCSV?.workbook.worksheets.event &&
    responses.push(xlsxCSV?.workbook.worksheets.event.validate(getSPITemplateValidators(SPI_CLASS.EVENT)).getState());

  xlsxCSV?.workbook.worksheets.occurrence &&
    responses.push(
      xlsxCSV?.workbook.worksheets.occurrence.validate(getSPITemplateValidators(SPI_CLASS.OCCURRENCE)).getState()
    );

  xlsxCSV?.workbook.worksheets.measurementorfact &&
    responses.push(
      xlsxCSV?.workbook.worksheets.measurementorfact
        .validate(getSPITemplateValidators(SPI_CLASS.MEASUREMENTORFACT))
        .getState()
    );

  xlsxCSV?.workbook.worksheets.resourcerelationship &&
    responses.push(
      xlsxCSV?.workbook.worksheets.resourcerelationship
        .validate(getSPITemplateValidators(SPI_CLASS.RESOURCERELATIONSHIP))
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
