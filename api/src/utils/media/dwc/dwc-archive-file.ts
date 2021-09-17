import xlsx from 'xlsx';
import { CSVWorksheet, ICsvState } from '../csv/csv-file';
import { ArchiveFile, IMediaState, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';

export enum DWC_CLASS {
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship',
  TAXON = 'taxon',
  META = 'meta'
}

export const DEFAULT_XLSX_SHEET = 'Sheet1';

export type DWCWorksheets = { [name in DWC_CLASS]?: CSVWorksheet };

/**
 * Supports Darwin Core Archive CSV files.
 *
 * Expects an array of known named-files
 *
 * @export
 * @class DWCArchive
 */
export class DWCArchive {
  rawFile: ArchiveFile;

  mediaValidation: MediaValidation;

  worksheets: DWCWorksheets;

  extra: { [name: string]: any };

  constructor(archiveFile: ArchiveFile) {
    this.rawFile = archiveFile;

    this.mediaValidation = new MediaValidation(this.rawFile.fileName);

    this.worksheets = {};

    // temporary storage for other non-csv files
    this.extra = {};

    // parse archive files
    this._initArchiveFiles();
  }

  _initArchiveFiles() {
    for (const rawFile of this.rawFile.mediaFiles) {
      switch (rawFile.name) {
        case DWC_CLASS.EVENT:
          this.worksheets[DWC_CLASS.EVENT] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.OCCURRENCE:
          this.worksheets[DWC_CLASS.OCCURRENCE] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.MEASUREMENTORFACT:
          this.worksheets[DWC_CLASS.MEASUREMENTORFACT] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.RESOURCERELATIONSHIP:
          this.worksheets[DWC_CLASS.RESOURCERELATIONSHIP] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.TAXON:
          this.worksheets[DWC_CLASS.TAXON] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.META:
          this.extra[DWC_CLASS.META] = rawFile;
      }
    }
  }

  isMediaValid(validationSchemaParser: ValidationSchemaParser): IMediaState {
    const validators = validationSchemaParser.getSubmissionValidations();

    const mediaValidation = this.validate(validators as DWCArchiveValidator[]);

    return mediaValidation.getState();
  }

  isContentValid(validationSchemaParser: ValidationSchemaParser): ICsvState[] {
    const csvStates: ICsvState[] = [];

    Object.keys(this.worksheets).forEach((fileName) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);

      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      const validators = [...fileValidators, ...columnValidators];

      const worksheet: CSVWorksheet = this.worksheets[fileName];

      if (!worksheet) {
        return;
      }

      const csvValidation = worksheet.validate(validators);

      csvStates.push(csvValidation.getState());
    });

    return csvStates;
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this.mediaValidation`
   *
   * @param {DWCArchiveValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof DWCArchive
   */
  validate(validators: DWCArchiveValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type DWCArchiveValidator = (dwcArchive: DWCArchive, ...rest: any) => DWCArchive;
