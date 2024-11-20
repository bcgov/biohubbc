import { WorkSheet } from 'xlsx';

export type CSVRow = Record<string, any>;

export interface CSVError {
  error: string;
  rowIndex: number;
  solution?: string;
  header?: string;
}

export interface CSVParams {
  cell: unknown;
  row: CSVRow;
  header: string;
  rowIndex: number;
  worksheet: WorkSheet;
}

export interface CSVHeader {
  $property: string;
  headerNames: string[];
  validateCell: (params: CSVParams) => CSVError[];
  setCellValue?: (params: CSVParams) => any;
}

export interface CSVConfig {
  headers: CSVHeader[];
  ignoreUnknownHeaders?: boolean;
  validateUnknownCell?: (params: CSVParams) => CSVError[];
  setUnknownCellValue?: (params: CSVParams) => any;
}
