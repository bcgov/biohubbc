import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
import { ArchiveFile, IMediaState, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';

export enum DWC_CLASS {
  RECORD = 'record',
  EVENT = 'event',
  LOCATION = 'location',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship',
  TAXON = 'taxon',
  META = 'meta',
  EML = 'eml'
}

export const DEFAULT_XLSX_SHEET = 'Sheet1';

export type DWCWorksheets = Partial<{ [name in DWC_CLASS]: CSVWorksheet }>;

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
        case DWC_CLASS.RECORD:
          this.worksheets[DWC_CLASS.RECORD] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.EVENT:
          this.worksheets[DWC_CLASS.EVENT] = new CSVWorksheet(
            rawFile.name,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.LOCATION:
          this.worksheets[DWC_CLASS.LOCATION] = new CSVWorksheet(
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
          break;
        case DWC_CLASS.EML:
          this.extra[DWC_CLASS.EML] = rawFile;
          break;
      }
    }
  }

  /**
   * Makes a CSV workbook from the worksheets included in the DwC archive file, enabling us
   * to run workbook validation on them.
   *
   * @return {*} {xlsx.WorkBook} The workbook made from all worksheets.
   * @memberof DWCArchive
   */
  _workbookFromWorksheets(): xlsx.WorkBook {
    const workbook = xlsx.utils.book_new();

    Object.entries(this.worksheets).forEach(([key, worksheet]) => {
      if (worksheet) {
        xlsx.utils.book_append_sheet(workbook, worksheet, key);
      }
    });

    return workbook;
  }

  /**
   * Runs all media-related validation for this DwC archive, based on given validation schema parser.
   * @param validationSchemaParser The validation schema
   * @returns {*} {void}
   * @memberof DWCArchive
   */
  validateMedia(validationSchemaParser: ValidationSchemaParser): void {
    const validators = validationSchemaParser.getSubmissionValidations();

    this.validate(validators as DWCArchiveValidator[]);
  }

  /**
   * Runs all content and workbook-related validation for this DwC archive, based on the given validation
   * schema parser.
   * @param {ValidationSchemaParser} validationSchemaParser The validation schema
   * @returns {*} {void}
   * @memberof DWCArchive
   */
  validateContent(validationSchemaParser: ValidationSchemaParser): void {
    // Run workbook validators
    const workbookValidators = validationSchemaParser.getWorkbookValidations();
    const csvWorkbook = new CSVWorkBook(this._workbookFromWorksheets());
    csvWorkbook.validate(workbookValidators);

    // Run content validators
    Object.entries(this.worksheets).forEach(([fileName, worksheet]) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);
      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      if (worksheet) {
        worksheet.validate([...fileValidators, ...columnValidators]);
      }
    });
  }

  /**
   * Returns the current media state belonging to the DwC archive file.
   * @returns {*} {IMediaState} The state of the DwC archive media.
   */
  getMediaState(): IMediaState {
    return this.mediaValidation.getState();
  }

  /**
   * Returns the current CSV states belonging to all worksheets in the DwC archive file.
   * @returns {*} {ICsvState[]} The state of each worksheet in the archive file.
   */
  getContentState(): ICsvState[] {
    return Object.values(this.worksheets)
      .filter((worksheet: CSVWorksheet | undefined): worksheet is CSVWorksheet => Boolean(worksheet))
      .map((worksheet: CSVWorksheet) => worksheet.csvValidation.getState());
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

export type DWCArchiveValidator = (dwcArchive: DWCArchive) => DWCArchive;
