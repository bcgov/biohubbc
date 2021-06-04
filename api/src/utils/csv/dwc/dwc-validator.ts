import { getFileMimeTypeValidator, getFileNullOrEmptyValidator } from '../csv-file-type-and-content-validator';
import {
  getDuplicateHeadersValidator,
  getValidHeadersValidator,
  hasRequiredHeadersValidator
} from '../csv-header-validator';
import { getRequiredFieldsValidator } from '../csv-row-validator';
import { CSVValidator, ICsvState, validateCSVFile } from '../csv-validation';
import { DWCArchive } from '../dwc/dwc-archive';

export enum DWC_CLASS {
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship',
  META = 'meta'
}

export const getValidHeaders = (dwcClass: DWC_CLASS) => {
  switch (dwcClass) {
    case DWC_CLASS.EVENT:
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
    case DWC_CLASS.OCCURRENCE:
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
    case DWC_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case DWC_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export const getRequiredHeaders = (dwcClass: DWC_CLASS) => {
  switch (dwcClass) {
    case DWC_CLASS.EVENT:
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
    case DWC_CLASS.OCCURRENCE:
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
    case DWC_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case DWC_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export const getRequiredFieldsByHeader = (dwcClass: DWC_CLASS) => {
  switch (dwcClass) {
    case DWC_CLASS.EVENT:
      return ['eventID'];
    case DWC_CLASS.OCCURRENCE:
      return ['eventID', 'occurrenceID', 'basisOfRecord', 'type', 'associatedTaxa', 'individualCount', 'identifiedBy'];
    case DWC_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case DWC_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    default:
      return [];
  }
};

export function isDWCArchiveValid(dwcArchive: DWCArchive): ICsvState[] {
  const responses: ICsvState[] = [];

  dwcArchive?.event &&
    responses.push(validateCSVFile(dwcArchive?.event, getDWCCSVValidators(DWC_CLASS.EVENT)).getState());

  dwcArchive?.occurrence &&
    responses.push(validateCSVFile(dwcArchive?.occurrence, getDWCCSVValidators(DWC_CLASS.OCCURRENCE)).getState());

  dwcArchive?.measurementorfact &&
    responses.push(
      validateCSVFile(dwcArchive?.measurementorfact, getDWCCSVValidators(DWC_CLASS.MEASUREMENTORFACT)).getState()
    );

  dwcArchive?.resourcerelationship &&
    responses.push(
      validateCSVFile(dwcArchive?.resourcerelationship, getDWCCSVValidators(DWC_CLASS.RESOURCERELATIONSHIP)).getState()
    );

  return responses;
}

export const getDWCCSVValidators = (dwcClass: DWC_CLASS): CSVValidator[] => {
  return [
    getFileNullOrEmptyValidator(),
    getFileMimeTypeValidator(['text/csv', 'text/plain']),
    getDuplicateHeadersValidator(),
    hasRequiredHeadersValidator(getRequiredHeaders(dwcClass)),
    getValidHeadersValidator(getValidHeaders(dwcClass)),
    getRequiredFieldsValidator(getRequiredFieldsByHeader(dwcClass))
  ];
};
