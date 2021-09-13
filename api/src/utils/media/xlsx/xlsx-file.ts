import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
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

  isMediaValid(validationSchemaParser: ValidationSchemaParser): IMediaState {
    const validators = validationSchemaParser.getSubmissionValidations();

    const mediaValidation = this.validate(validators as XLSXCSVValidator[]);

    return mediaValidation.getState();
  }

  isContentValid(validationSchemaParser: ValidationSchemaParser): ICsvState[] {
    const csvStates: ICsvState[] = [];

    Object.keys(this.workbook.worksheets).forEach((fileName) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);

      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      const validators = [...fileValidators, ...columnValidators];

      const worksheet: CSVWorksheet = this.workbook.worksheets[fileName];

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
   * @param {XLSXCSVValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof XLSXCSV
   */
  validate(validators: XLSXCSVValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type XLSXCSVValidator = (archiveFile: XLSXCSV, ...rest: any) => XLSXCSV;
