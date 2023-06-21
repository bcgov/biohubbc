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

    this.workbook = new CSVWorkBook(
      // See https://docs.sheetjs.com/docs/api/parse-options for details on parsing options
      xlsx.read(this.rawFile.buffer, { cellDates: true, cellNF: true, cellHTML: false, ...options })
    );
  }

  /**
   * Runs all media-related validation for this CSV file, based on given validation schema parser.
   * @param validationSchemaParser The validation schema
   * @returns {*} {void}
   * @memberof XLSXCSV
   */
  validateMedia(validationSchemaParser: ValidationSchemaParser): void {
    const validators = validationSchemaParser.getSubmissionValidations();

    this.validate(validators as XLSXCSVValidator[]);
  }

  /**
   * Runs all content and workbook-related validation for this CSV file, based on the given validation
   * schema parser.
   *
   * @param {ValidationSchemaParser} validationSchemaParser The validation schema
   * @return {*}  {void}
   * @memberof XLSXCSV
   */
  validateContent(validationSchemaParser: ValidationSchemaParser): void {
    // Run workbook validators.
    const workbookValidators = validationSchemaParser.getWorkbookValidations();
    this.workbook.validate(workbookValidators);

    // Run content validators.
    Object.entries(this.workbook.worksheets).forEach(([fileName, worksheet]) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);
      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      const validationRules = [...fileValidators, ...columnValidators];

      if (validationRules.length) {
        worksheet.validate(validationRules);
      }
    });
  }

  /**
   * Returns the current media state belonging to the CSV file.
   * @returns {*} {IMediaState} The state of the CSV media.
   * @memberof XLSXCSV
   */
  getMediaState(): IMediaState {
    return this.mediaValidation.getState();
  }

  /**
   * Returns the current CSV states belonging to all worksheets in the CSV file.
   * @returns {*} {ICsvState[]} The state of each worksheet in the CSV file.
   * @memberof XLSXCSV
   */
  getContentState(): ICsvState[] {
    return Object.values(this.workbook.worksheets)
      .map((worksheet: CSVWorksheet) => worksheet.csvValidation.getState())
      .filter(Boolean);
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

export type XLSXCSVTransformer = {
  pivot: string;
  transform: (xlsxCsv: XLSXCSV, modifiers?: Record<string, any>) => XLSXCSV;
};
