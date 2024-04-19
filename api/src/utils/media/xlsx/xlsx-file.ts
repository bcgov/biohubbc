import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
import { IMediaState, MediaFile, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';

export const DEFAULT_XLSX_SHEET_NAME = 'Sheet1' as const;

/**
 * Supports XLSX CSV files.
 *
 * @export
 * @class XLSXCSV
 */
export class XLSXCSV {
  _rawFile: MediaFile;

  _mediaValidation: MediaValidation;

  _workbook: CSVWorkBook;

  constructor(file: MediaFile, options?: xlsx.ParsingOptions) {
    this._rawFile = file;

    this._mediaValidation = new MediaValidation(this._rawFile.fileName);

    this._workbook = new CSVWorkBook(
      // See https://docs.sheetjs.com/docs/api/parse-options for details on parsing options
      xlsx.read(this._rawFile.buffer, { cellDates: true, cellNF: true, cellHTML: false, ...options })
    );
  }

  /**
   * Getter for the raw file.
   *
   * @readonly
   * @memberof XLSXCSV
   */
  get rawFile() {
    return this._rawFile;
  }

  /**
   * Getter for the media validation.
   *
   * @readonly
   * @memberof XLSXCSV
   */
  get mediaValidation() {
    return this._mediaValidation;
  }

  /**
   * Getter for the workbook.
   *
   * @readonly
   * @memberof XLSXCSV
   */
  get workbook() {
    return this._workbook;
  }

  /**
   * Runs all media-related validation for this CSV file, based on given validation schema parser.
   * @param validationSchemaParser The validation schema
   * @returns {*} {void}
   * @memberof XLSXCSV
   */
  validateMedia(validationSchemaParser: ValidationSchemaParser): void {
    const validators = validationSchemaParser.getSubmissionValidations();

    this.validate(validators);
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
    this._workbook.validate(workbookValidators);

    // Run content validators.
    Object.entries(this._workbook.worksheets).forEach(([fileName, worksheet]) => {
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
    return this._mediaValidation.getState();
  }

  /**
   * Returns the current CSV states belonging to all worksheets in the CSV file.
   * @returns {*} {ICsvState[]} The state of each worksheet in the CSV file.
   * @memberof XLSXCSV
   */
  getContentState(): ICsvState[] {
    return Object.values(this._workbook.worksheets)
      .map((worksheet: CSVWorksheet) => worksheet.csvValidation.getState())
      .filter(Boolean);
  }

  worksheetToBuffer(worksheet: xlsx.WorkSheet): Buffer {
    const newWorkbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(newWorkbook, worksheet, DEFAULT_XLSX_SHEET_NAME);

    return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' });
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this._mediaValidation`
   *
   * @param {XLSXCSVValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof XLSXCSV
   */
  validate(validators: XLSXCSVValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this._mediaValidation;
  }
}

export type XLSXCSVValidator = (xlsxCsv: XLSXCSV) => XLSXCSV;

export type XLSXCSVTransformer = {
  pivot: string;
  transform: (xlsxCsv: XLSXCSV, modifiers?: Record<string, any>) => XLSXCSV;
};
