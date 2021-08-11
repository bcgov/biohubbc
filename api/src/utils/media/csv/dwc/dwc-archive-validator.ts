import { MediaValidator } from '../../media-file';
import { getFileEmptyValidator, getFileMimeTypeValidator } from '../../validation/file-type-and-content-validator';
import { CSVValidator } from '../csv-file';
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
import { DWC_CLASS } from './dwc-archive-file';

/**
 * TODO This entire file should eventually be replaced by calls to the reference data service
 */

const getValidHeaders = (dwcClass: DWC_CLASS): string[] => {
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
        'identifiedBy',
        'organismQuantity',
        'organismQuantityType'
      ];
    case DWC_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case DWC_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    case DWC_CLASS.TAXON:
      return ['eventID', 'taxonID', 'vernacularName'];
    default:
      return [];
  }
};

const getRequiredHeaders = (dwcClass: DWC_CLASS): string[] => {
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
    case DWC_CLASS.TAXON:
      return ['eventID', 'taxonID'];
    default:
      return [];
  }
};

const getRequiredFieldsByHeader = (dwcClass: DWC_CLASS): string[] => {
  switch (dwcClass) {
    case DWC_CLASS.EVENT:
      return ['eventID'];
    case DWC_CLASS.OCCURRENCE:
      return ['eventID', 'occurrenceID', 'basisOfRecord', 'type', 'associatedTaxa', 'individualCount', 'identifiedBy'];
    case DWC_CLASS.MEASUREMENTORFACT:
      return ['measurementID', 'occurrenceID', 'measurementType', 'measurementUnit', 'measurementValue'];
    case DWC_CLASS.RESOURCERELATIONSHIP:
      return ['resourceRelationshipID', 'resourceID', 'relatedResourceID', 'relationshipOfResource'];
    case DWC_CLASS.TAXON:
      return ['eventID', 'taxonID'];
    default:
      return [];
  }
};

const getCodeValuesByHeader = (dwcClass: DWC_CLASS): ICodeValuesByHeader[] => {
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

/**
 * Get content validation rules for a given DWC class.
 *
 * @param {DWC_CLASS} dwcClass
 * @return {*}  {CSVValidator[]}
 */
export const getDWCCSVValidators = (dwcClass: DWC_CLASS): CSVValidator[] => {
  return [
    getDuplicateHeadersValidator(),
    hasRequiredHeadersValidator(getRequiredHeaders(dwcClass)),
    getValidHeadersValidator(getValidHeaders(dwcClass)),
    getRequiredFieldsValidator(getRequiredFieldsByHeader(dwcClass)),
    getCodeValueFieldsValidator(getCodeValuesByHeader(dwcClass))
  ];
};

const getRequiredMimeTypesByDWCClass = (dwcClass: DWC_CLASS): RegExp[] => {
  switch (dwcClass) {
    case DWC_CLASS.EVENT:
    case DWC_CLASS.OCCURRENCE:
    case DWC_CLASS.MEASUREMENTORFACT:
    case DWC_CLASS.RESOURCERELATIONSHIP:
    case DWC_CLASS.TAXON:
      return [/text\/plain/, /text\/csv/];
    case DWC_CLASS.META:
      return [/application\/xml/];
    default:
      return [];
  }
};

/**
 * Get media validation rules for a given DWC class.
 *
 * @param {DWC_CLASS} dwcClass
 * @return {*}  {MediaValidator[]}
 */
export const getDWCMediaValidators = (dwcClass: DWC_CLASS): MediaValidator[] => {
  return [getFileEmptyValidator(), getFileMimeTypeValidator(getRequiredMimeTypesByDWCClass(dwcClass))];
};
