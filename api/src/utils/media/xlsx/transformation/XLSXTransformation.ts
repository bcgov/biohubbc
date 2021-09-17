import xlsx from 'xlsx';
import { DEFAULT_XLSX_SHEET } from '../../../../utils/media/dwc/dwc-archive-file';

type Column = { name: string; value: string | number | undefined };

type Row = Column[];

export class CSVFile {
  fileName: string;
  rows: Row[];

  constructor(fileName: string, rows?: Row[]) {
    this.fileName = fileName;
    this.rows = rows || [];
  }

  hasRow(rowIndex: number): boolean {
    return !!this.rows[rowIndex];
  }

  addRow(row: Row) {
    this.rows.push(row);
  }

  addColumn(rowIndex: number, column: Column) {
    if (!this.hasRow(rowIndex)) {
      this.rows[rowIndex] = [];
    }

    this.rows[rowIndex].push(column);
  }

  toCSV(headerNames?: string[]): any[][] {
    const uniqueColumnNames: Set<string> = new Set();

    if (!headerNames) {
      this.rows.forEach((row) => {
        row.forEach((column) => uniqueColumnNames.add(column.name));
      });
    }

    const headersToSortBy = headerNames || Array.from(uniqueColumnNames);

    const csvData: any[][] = [];

    this.rows.forEach((row, rowIndex) => {
      csvData[rowIndex] = [];

      row.forEach((column) => {
        const headerIndex = headersToSortBy.indexOf(column.name);

        if (headerIndex !== -1) {
          csvData[rowIndex][headerIndex] = column.value;
        }
      });
    });

    // Add headers array to the start of the array
    csvData.unshift(headersToSortBy);

    return csvData;
  }

  toBuffer(headerNames?: string[]): Buffer {
    const csvData = this.toCSV(headerNames);

    const newWorkbook = xlsx.utils.book_new();

    const newWorksheet = xlsx.utils.aoa_to_sheet(csvData);

    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, DEFAULT_XLSX_SHEET);

    return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' }) as Buffer;
  }
}

export class XLSXTransformation {
  files: CSVFile[];

  constructor() {
    this.files = [
      new CSVFile('event', []),
      new CSVFile('occurrence', []),
      new CSVFile('measurementorfact', []),
      new CSVFile('resourcerelationship', []),
      new CSVFile('taxon', [])
    ];
  }

  hasFile(fileName: string): boolean {
    return this.files.some((file) => file.fileName === fileName);
  }

  getFileIndex(fileName: string): number {
    return this.files.findIndex((file) => file.fileName === fileName);
  }

  addFile(fileName: string, rows: Row[]) {
    if (this.hasFile(fileName)) {
      return;
    }

    this.files.push(new CSVFile(fileName, rows));
  }

  hasRow(fileName: string, rowIndex: number): boolean {
    const fileIndex = this.getFileIndex(fileName);

    return !!this.files[fileIndex].rows[rowIndex];
  }

  addRow(fileName: string, row: Row) {
    if (!this.hasFile(fileName)) {
      this.addFile(fileName, [row]);

      return;
    }

    const fileIndex = this.getFileIndex(fileName);

    this.files[fileIndex].rows.push(row);
  }

  addColumn(fileName: string, rowIndex: number, column: Column) {
    if (!this.hasFile(fileName)) {
      this.addFile(fileName, [[column]]);

      return;
    }

    const fileIndex = this.getFileIndex(fileName);

    if (!this.hasRow(fileName, rowIndex)) {
      this.files[fileIndex].rows[rowIndex] = [];
    }

    this.files[fileIndex].rows[rowIndex].push(column);
  }
}
