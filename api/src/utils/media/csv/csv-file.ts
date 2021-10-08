import xlsx from 'xlsx';
import { IMediaState, MediaValidation } from '../media-file';

export type CSVWorksheets = { [name: string]: CSVWorksheet };

export class CSVWorkBook {
  rawWorkbook: xlsx.WorkBook;

  worksheets: CSVWorksheets;

  constructor(workbook?: xlsx.WorkBook) {
    this.rawWorkbook = workbook || xlsx.utils.book_new();

    const worksheets = {};

    Object.entries(this.rawWorkbook.Sheets).forEach(([key, value]) => {
      worksheets[key] = new CSVWorksheet(key, value);
    });

    this.worksheets = worksheets;
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

    const ref = this.worksheet['!ref'];

    if (!ref) {
      return [];
    }

    if (!this._headers.length) {
      const originalRange = xlsx.utils.decode_range(ref);

      // Specify range to only include the 0th row (header row)
      const customRange: xlsx.Range = { ...originalRange, e: { ...originalRange.e, r: 0 } };

      const aoaHeaders: any[][] = xlsx.utils.sheet_to_json(this.worksheet, {
        header: 1,
        blankrows: false,
        range: customRange
      });

      if (aoaHeaders.length > 0) {
        // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
        this._headers = aoaHeaders[0].map((item) => item?.trim());
      }
    }

    return this._headers;
  }

  getHeadersLowerCase(): string[] {
    if (!this._headersLowerCase.length) {
      this._headersLowerCase = this.getHeaders().map((item) => item?.toLowerCase());
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

    const ref = this.worksheet['!ref'];

    if (!ref) {
      return [];
    }

    if (!this._rows.length) {
      const rowsToReturn: string[][] = [];

      const originalRange = xlsx.utils.decode_range(ref);

      for (let i = 1; i <= originalRange.e.r; i++) {
        const row = new Array(this.getHeaders().length);
        let rowHasValues = false;

        for (let j = 0; j <= originalRange.e.c; j++) {
          const cellAddress = { c: j, r: i };
          const cellRef = xlsx.utils.encode_cell(cellAddress);
          const cellValue = this.worksheet[cellRef];

          if (!cellValue) {
            continue;
          }

          // Some cell types (like dates) store different interpretations of the raw value in different properties of
          // the `cellValue`. In these cases, always try and return the string version `w`, before returning the
          // raw version `v`.
          // See https://www.npmjs.com/package/xlsx -> Cell Object
          row[j] = cellValue.w || cellValue.v;

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

  validate(validators: CSVValidator[]): CSVValidation {
    validators.forEach((validator) => validator(this));

    return this.csvValidation;
  }
}

export type CSVValidator = (csvWorksheet: CSVWorksheet) => CSVWorksheet;

// ensure these error codes match the 'name' column in the table: submission_message_type

export type IHeaderErrorCode =
  | 'Duplicate Header'
  | 'Unknown Header'
  | 'Missing Required Header'
  | 'Missing Recommended Header'
  | 'Miscellaneous';

export type IRowErrorCode =
  | 'Missing Required Field'
  | 'Unexpected Format'
  | 'Out of Range'
  | 'Invalid Value'
  | 'Miscellaneous';

export interface IHeaderError {
  errorCode: IHeaderErrorCode;
  message: string;
  col: string | number;
}

export interface IRowError {
  errorCode: IRowErrorCode;
  message: string;
  col: string;
  row: number;
}
export interface ICsvState extends IMediaState {
  headerErrors: IHeaderError[];
  rowErrors: IRowError[];
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

  constructor(fileName: string) {
    super(fileName);

    this.headerErrors = [];
    this.rowErrors = [];
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

  getState(): ICsvState {
    return {
      fileName: this.fileName,
      fileErrors: this.fileErrors,
      headerErrors: this.headerErrors,
      rowErrors: this.rowErrors,
      isValid: this.isValid
    };
  }
}
