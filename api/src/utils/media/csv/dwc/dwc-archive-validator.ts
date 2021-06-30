import { CSVValidator, ICsvState } from '../csv-file';
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
import { DWCArchive } from './dwc-archive-file';

export enum DWC_CLASS {
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship',
  META = 'meta'
}

export const getValidHeaders = (dwcClass: DWC_CLASS): string[] => {
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

export const getRequiredHeaders = (dwcClass: DWC_CLASS): string[] => {
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

export const getRequiredFieldsByHeader = (dwcClass: DWC_CLASS): string[] => {
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

export const getCodeValuesByHeader = (dwcClass: DWC_CLASS): ICodeValuesByHeader[] => {
  switch (dwcClass) {
    case DWC_CLASS.OCCURRENCE:
      return [
        { header: 'sex', codeValues: ['male', 'female'] },
        { header: 'lifeStage', codeValues: ['adult', 'yearling', 'juvenile', 'hatchling'] }
      ];
    default:
      return [];
  }
};

export function isDWCArchiveValid(dwcArchive: DWCArchive): ICsvState[] {
  const responses: ICsvState[] = [];

  dwcArchive?.worksheets.event &&
    responses.push(dwcArchive?.worksheets.event.validate(getDWCCSVValidators(DWC_CLASS.EVENT)).getState());

  dwcArchive?.worksheets.occurrence &&
    responses.push(dwcArchive?.worksheets.occurrence.validate(getDWCCSVValidators(DWC_CLASS.OCCURRENCE)).getState());

  dwcArchive?.worksheets.measurementorfact &&
    responses.push(
      dwcArchive?.worksheets.measurementorfact.validate(getDWCCSVValidators(DWC_CLASS.MEASUREMENTORFACT)).getState()
    );

  dwcArchive?.worksheets.resourcerelationship &&
    responses.push(
      dwcArchive?.worksheets.resourcerelationship
        .validate(getDWCCSVValidators(DWC_CLASS.RESOURCERELATIONSHIP))
        .getState()
    );

  return responses;
}

export const getDWCCSVValidators = (dwcClass: DWC_CLASS): CSVValidator[] => {
  return [
    getDuplicateHeadersValidator(),
    hasRequiredHeadersValidator(getRequiredHeaders(dwcClass)),
    getValidHeadersValidator(getValidHeaders(dwcClass)),
    getRequiredFieldsValidator(getRequiredFieldsByHeader(dwcClass)),
    getCodeValueFieldsValidator(getCodeValuesByHeader(dwcClass))
  ];
};
