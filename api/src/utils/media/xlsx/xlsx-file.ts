import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
import { DEFAULT_XLSX_SHEET } from '../dwc/dwc-archive-file';
import { IMediaState, MediaFile, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';

/**
 * Supports XLSX CSV files.
 *
 * @export
 * @class XLSXCSV
 */
export class XLSXCSV {
  rawFile: MediaFile;

  mediaValidation: MediaValidation;

  workbook: CSVWorkBook;

  constructor(file: MediaFile, options?: xlsx.ParsingOptions) {
    this.rawFile = file;

    this.mediaValidation = new MediaValidation(this.rawFile.fileName);

    this.workbook = new CSVWorkBook(xlsx.read(this.rawFile.buffer, { ...options }));
  }

  /**
   * Determines validity of submission media.
   * @param validationSchemaParser 
   * @returns 
   */
  isMediaValid(validationSchemaParser: ValidationSchemaParser): IMediaState {
    const validators = validationSchemaParser.getSubmissionValidations();

    const mediaValidation = this.validate(validators as XLSXCSVValidator[]);

    return mediaValidation.getState();
  }

  /**
   * Determines the validity of a workbook belonging to a submission. Workbook validators
   * are different in that they validate an entire submission, but return validations
   * particular to worksheets within the workbook.
   * @param validationSchemaParser 
   * @returns 
   */
  isWorkbookValid(validationSchemaParser: ValidationSchemaParser): ICsvState[] {
    const csvStates: ICsvState[] = [];

    const workbookValidators = validationSchemaParser.getWorkbookValidations();

    this.workbook.validate(workbookValidators)

    Object.values(this.workbook.worksheets).forEach((worksheet: CSVWorksheet) => {
      csvStates.push(worksheet.csvValidation.getState());
    });

    return csvStates;
  }

  /**
   * Determines the validity of individual worksheets belonging to a submission
   * @param validationSchemaParser 
   * @returns 
   */
  isContentValid(validationSchemaParser: ValidationSchemaParser): ICsvState[] {
    const csvStates: ICsvState[] = [];

    Object.keys(this.workbook.worksheets).forEach((fileName) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);

      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      const validators = [...fileValidators, ...columnValidators];

      const worksheet: CSVWorksheet = this.workbook.worksheets[fileName];

      if (!worksheet || fileName === 'Picklist Values') {
        return;
      }

      const csvValidation = worksheet.validate(validators);

      csvStates.push(csvValidation.getState());
    });

    return csvStates;
  }

  worksheetToBuffer(worksheet: xlsx.WorkSheet): Buffer {
    const newWorkbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(newWorkbook, worksheet, DEFAULT_XLSX_SHEET);

    return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' });
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this.mediaValidation`
   *
   * @param {XLSXCSVValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof XLSXCSV
   */
  validate(validators: XLSXCSVValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type XLSXCSVValidator = (xlsxCsv: XLSXCSV) => XLSXCSV;

export type XLSXCSVTransformer = { pivot: string; transform: (xlsxCsv: XLSXCSV, modifiers?: object) => XLSXCSV };
