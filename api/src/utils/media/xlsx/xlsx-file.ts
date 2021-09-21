import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
import { IMediaState, MediaFile, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';
import { TransformationSchemaParser } from './transformation/transformation-schema-parser';
import { SourceFileTransformer, XLSXTransformationTarget } from './transformation/XLSXTransformation';

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

  xlsxTransformationTarget: XLSXTransformationTarget;

  constructor(file: MediaFile, options?: xlsx.ParsingOptions) {
    this.rawFile = file;

    this.mediaValidation = new MediaValidation(this.rawFile.fileName);

    this.workbook = new CSVWorkBook(xlsx.read(this.rawFile.buffer, { ...options }));

    this.xlsxTransformationTarget = new XLSXTransformationTarget();
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

  transformToDWC(transformationSchemaParser: TransformationSchemaParser): XLSXTransformationTarget {
    Object.keys(this.workbook.worksheets).forEach((fileName) => {
      const transformers = transformationSchemaParser.getFileTransformations(fileName);

      const fileTransformer = new SourceFileTransformer(fileName, transformers);

      fileTransformer.transform(this);
    });

    return this.xlsxTransformationTarget;
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

  /**
   * Executes each transformer function in the provided `transformers` against this instance, returning
   * `this.xlsxTransformationTarget`
   *
   * @param {((XLSXCSVTransformer | XLSXCSVTransformer[])[])} transformers
   * @return {*}  {XLSXTransformationTarget}
   * @memberof XLSXCSV
   */
}

export type XLSXCSVValidator = (xlsxCsv: XLSXCSV) => XLSXCSV;

export type XLSXCSVTransformer = { pivot: string; transform: (xlsxCsv: XLSXCSV, modifiers?: object) => XLSXCSV };
