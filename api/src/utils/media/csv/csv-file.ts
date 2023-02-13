import xlsx from 'xlsx';
import { SUBMISSION_MESSAGE_TYPE } from '../../../constants/status';
import { safeToLowerCase, safeTrim } from '../../string-utils';
import { IMediaState, MediaValidation } from '../media-file';
import { getCellValue, getWorksheetRange, replaceCellDates, trimCellWhitespace } from '../xlsx/xlsx-utils';

export type CSVWorksheets = { [name: string]: CSVWorksheet };
export type WorkBookValidators = { [name: string]: CSVValidation };

export class CSVWorkBook {
  rawWorkbook: xlsx.WorkBook;

  worksheets: CSVWorksheets;

  constructor(workbook?: xlsx.WorkBook) {
    this.rawWorkbook = workbook || xlsx.utils.book_new();

    const worksheets: CSVWorksheets = {};

    Object.entries(this.rawWorkbook.Sheets).forEach(([key, value]) => {
      worksheets[key] = new CSVWorksheet(key, value);
    });

    this.worksheets = worksheets;
  }

  /**
   * Performs all of the given workbook validators on the workbook. Results of the validation
   * are stored in the `csvValidation` property on each of the worksheets within the workbook. This
   * method returns the corresponding validations in an object.
   *
   * @param {WorkBookValidator[]} validators A series of validators to be run on the workbook
   * @return {*}  {WorkBookValidation} A key-value pair representing all CSV validations for each worksheet,
   * where the keys are the names of the worksheets and the values are the corresponding CSV validations.
   * @memberof CSVWorkBook
   */
  validate(validators: WorkBookValidator[]): WorkBookValidation {
    validators.forEach((validator) => validator(this));

    const validations: WorkBookValidation = {};
    Object.entries(this.worksheets).forEach(([key, value]) => {
      validations[key] = value.csvValidation;
    });

    return validations;
  }
}

export class CSVWorksheet {
  name: string;

  worksheet: xlsx.WorkSheet;

  _headers: string[];
  _headersLowerCase: string[];
  _rows: string[][];
  _rowObjects: object[];

  csvValidation: CSVValidation;

  constructor(name: string, worksheet?: xlsx.WorkSheet) {
    this.name = name;

    this.worksheet = worksheet || xlsx.utils.aoa_to_sheet([]);

    this._headers = [];
    this._headersLowerCase = [];
    this._rows = [];
    this._rowObjects = [];

    this.csvValidation = new CSVValidation(this.name);
  }

  /**
   * Returns an array of header values.
   *
   * Note: This is always the first row (index 0)
   *
   * @return {*}  {string[]}
   * @memberof CSVWorksheet
   */
  getHeaders(): string[] {
    if (!this.worksheet) {
      return [];
    }

    const originalRange = getWorksheetRange(this.worksheet);

    if (!originalRange) {
      return [];
    }

    if (!this._headers.length) {
      // Specify range to only include the 0th row (header row)
      const customRange: xlsx.Range = { ...originalRange, e: { ...originalRange.e, r: 0 } };

      const aoaHeaders: any[][] = xlsx.utils.sheet_to_json(this.worksheet, {
        header: 1,
        blankrows: false,
        range: customRange
      });

      if (aoaHeaders.length > 0) {
        // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
        this._headers = aoaHeaders[0].map(safeTrim);
      }
    }

    return this._headers;
  }

  getHeadersLowerCase(): string[] {
    if (!this._headersLowerCase.length) {
      this._headersLowerCase = this.getHeaders().map(safeToLowerCase);
    }

    return this._headersLowerCase;
  }

  getHeaderIndex(headerName: string): number {
    return this.getHeaders().indexOf(headerName);
  }

  /**
   * Return an array of row value arrays.
   *
   * Note: This does not include the first row (header row).
   *
   * @return {*}  {string[][]}
   * @memberof CSVWorksheet
   */
  getRows(): string[][] {
    if (!this.worksheet) {
      return [];
    }

    const originalRange = getWorksheetRange(this.worksheet);

    if (!originalRange) {
      return [];
    }

    if (!this._rows.length) {
      const rowsToReturn: string[][] = [];

      for (let i = 1; i <= originalRange.e.r; i++) {
        const row = new Array(this.getHeaders().length);
        let rowHasValues = false;

        for (let j = 0; j <= originalRange.e.c; j++) {
          const cellAddress = { c: j, r: i };
          const cellRef = xlsx.utils.encode_cell(cellAddress);
          const cell = this.worksheet[cellRef];

          if (!cell) {
            continue;
          }

          row[j] = getCellValue(trimCellWhitespace(replaceCellDates(cell)));

          rowHasValues = true;
        }

        if (row.length && rowHasValues) {
          rowsToReturn.push(row);
        }
      }

      this._rows = rowsToReturn;
    }

    return this._rows;
  }

  getRowObjects(): object[] {
    if (!this.worksheet) {
      return [];
    }

    const ref = this.worksheet['!ref'];

    if (!ref) {
      return [];
    }

    if (!this._rowObjects.length) {
      const rowObjectsArray: object[] = [];
      const rows = this.getRows();
      const headers = this.getHeaders();

      rows.forEach((row: string[]) => {
        const rowObject = {};

        headers.forEach((header: string, index: number) => {
          rowObject[header] = row[index];
        });

        rowObjectsArray.push(rowObject);
      });

      this._rowObjects = rowObjectsArray;
    }

    return this._rowObjects;
  }

  getCell(headerName: string, rowIndex: number) {
    const headerIndex = this.getHeaderIndex(headerName);

    if (headerIndex < 0) {
      return undefined;
    }

    const rows = this.getRows();

    const row = rows?.[rowIndex];

    if (!row || !row.length) {
      return undefined;
    }

    return row[headerIndex];
  }

  /**
   * Runs all of the given validators on the worksheet, whereby the results of all validations
   * are stored in `this.csvValidation`.
   *
   * @param {CSVValidator[]} validators A series of CSV validators to be run on the worksheet.
   * @return {*}  {CSVValidation} The result of all validations, namely `this.csvValidation`.
   * @memberof CSVWorksheet
   */
  validate(validators: CSVValidator[]): CSVValidation {
    validators.forEach((validator) => validator(this));

    return this.csvValidation;
  }
}

export type CSVValidator = (csvWorksheet: CSVWorksheet) => CSVWorksheet;
export type WorkBookValidator = (csvWorkBook: CSVWorkBook) => CSVWorkBook;

// ensure these error codes match the 'name' column in the table: submission_message_type

export interface IHeaderError {
  errorCode:
    | SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER
    | SUBMISSION_MESSAGE_TYPE.UNKNOWN_HEADER
    | SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER
    | SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER;
  message: string;
  col: string | number;
}

export interface IRowError {
  errorCode:
    | SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD
    | SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE
    | SUBMISSION_MESSAGE_TYPE.INVALID_VALUE
    | SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT
    | SUBMISSION_MESSAGE_TYPE.NON_UNIQUE_KEY
    | SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY;
  message: string;
  col: string;
  row: number;
}

export interface IKeyError {
  errorCode: SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY;
  message: string;
  colNames: string[];
  rows: number[];
}

export interface ICsvState extends IMediaState {
  headerErrors: IHeaderError[];
  rowErrors: IRowError[];
  keyErrors: IKeyError[];
}

/**
 * Supports getting/setting validation errors for any csv file.
 *
 * @export
 * @class CSVValidation
 * @extends {MediaValidation}
 */
export class CSVValidation extends MediaValidation {
  headerErrors: IHeaderError[];
  rowErrors: IRowError[];
  keyErrors: IKeyError[];

  constructor(fileName: string) {
    super(fileName);

    this.headerErrors = [];
    this.rowErrors = [];
    this.keyErrors = [];
  }

  addHeaderErrors(errors: IHeaderError[]) {
    this.headerErrors = this.headerErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addHeaderWarnings(errors: IHeaderError[]) {
    this.headerErrors = this.headerErrors.concat(errors);
  }

  addRowErrors(errors: IRowError[]) {
    this.rowErrors = this.rowErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addKeyErrors(errors: IKeyError[]) {
    this.keyErrors = this.keyErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  getState(): ICsvState {
    return {
      fileName: this.fileName,
      fileErrors: this.fileErrors,
      headerErrors: this.headerErrors,
      rowErrors: this.rowErrors,
      keyErrors: this.keyErrors,
      isValid: this.isValid
    };
  }
}

export type WorkBookValidation = { [name: string]: CSVValidation };
