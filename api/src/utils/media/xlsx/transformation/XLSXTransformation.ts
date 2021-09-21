import xlsx from 'xlsx';
import { DEFAULT_XLSX_SHEET } from '../../../../utils/media/dwc/dwc-archive-file';
import { XLSXCSV, XLSXCSVTransformer } from '../xlsx-file';

export type Column = { id: string | number; name: string; value: string | number | undefined };

// type Row = Column[];

export class SourceFileTransformer {
  fileName: string;
  rawTransformers: XLSXCSVTransformer[];

  pivotedTransformers: XLSXCSVTransformer[][];

  // [

  //   [
  //     {
  //       pivot: ''
  //       transform: () => {}
  //     },
  //     {
  //       pivot: 'p1',
  //       transform: () => {}
  //     }
  //   ]
  // ]

  constructor(fileName: string, transformers: XLSXCSVTransformer[]) {
    this.fileName = fileName;
    this.rawTransformers = transformers;

    this.pivotedTransformers = this._pivotTransformers();
  }

  _pivotTransformers() {
    const regularTransformations: XLSXCSVTransformer[] = [];
    const pivotTransformations: XLSXCSVTransformer[] = [];

    this.rawTransformers.forEach((transformer) => {
      if (transformer.pivot) {
        pivotTransformations.push(transformer);
      } else {
        regularTransformations.push(transformer);
      }
    });

    const pivotedTransformations: XLSXCSVTransformer[][] = [];

    if (pivotTransformations.length) {
      pivotTransformations.forEach((pivotTransformer) => {
        pivotedTransformations.push([
          pivotTransformer,
          ...regularTransformations.map((regularTransformation) => {
            return { pivot: pivotTransformer.pivot, transform: regularTransformation.transform };
          })
        ]);
      });
    } else {
      pivotedTransformations.push(regularTransformations);
    }

    console.log('-------------------------');
    console.log(pivotedTransformations);
    console.log('-------------------------');

    return pivotedTransformations;
  }

  transform(xlsxCsv: XLSXCSV): XLSXCSV {
    this.pivotedTransformers.forEach((transformers) => {
      transformers.forEach((transformer) => {
        transformer.transform(xlsxCsv, { pivot: transformer.pivot || '' });
      });
    });

    return xlsxCsv;
  }
}

// export class TargetFile {
//   fileName: string;
//   rows: Row[];

//   constructor(fileName: string, rows?: Row[]) {
//     this.fileName = fileName;
//     this.rows = rows || [];
//   }

//   hasRow(rowIndex: number): boolean {
//     return !!this.rows[rowIndex];
//   }

//   addRow(row: Row) {
//     this.rows.push(row);
//   }

//   addColumn(rowIndex: number, column: Column) {
//     if (!this.hasRow(rowIndex)) {
//       this.rows[rowIndex] = [];
//     }

//     this.rows[rowIndex].push(column);
//   }

//   toCSV(headerNames?: string[]): any[][] {
//     const uniqueColumnNames: Set<string> = new Set();

//     if (!headerNames) {
//       this.rows.forEach((row) => {
//         row.forEach((column) => uniqueColumnNames.add(column.name));
//       });
//     }

//     const headersToSortBy = headerNames || Array.from(uniqueColumnNames);

//     const csvData: any[][] = [];

//     this.rows.forEach((row, rowIndex) => {
//       csvData[rowIndex] = [];

//       row.forEach((column) => {
//         const headerIndex = headersToSortBy.indexOf(column.name);

//         if (headerIndex !== -1) {
//           csvData[rowIndex][headerIndex] = column.value;
//         }
//       });
//     });

//     // Add headers array to the start of the array
//     csvData.unshift(headersToSortBy);

//     return csvData;
//   }

//   toBuffer(headerNames?: string[]): Buffer {
//     const csvData = this.toCSV(headerNames);

//     const newWorkbook = xlsx.utils.book_new();

//     const newWorksheet = xlsx.utils.aoa_to_sheet(csvData);

//     xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, DEFAULT_XLSX_SHEET);

//     return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' }) as Buffer;
//   }
// }

export class TargetFile {
  fileName: string;

  cols: Column[];
  // rows: Row[] = [];
  // currentRow = -1;

  constructor(fileName: string) {
    this.fileName = fileName;

    this.cols = [];
  }

  // getCurrentRow(): number {
  //   return this.currentRow;
  // }

  // hasRow(rowIndex: number): boolean {
  //   return rowIndex >= 0 && rowIndex <= this.currentRow;
  // }

  // addRow() {
  //   this.currentRow = this.currentRow + 1;

  //   this.rows[this.currentRow] = [];
  // }

  hasColumn(column: Column): boolean {
    return !!this.cols.find((col) => col.id === column.id && col.name === column.name && col.value === column.value);
  }

  // getRowIndexByColumn(columnName: string, columnValue: any): number {
  //   return this.rows.findIndex((row) => {
  //     !!row.find((column) => column.name === columnName && column.value === columnValue);
  //   });
  // }

  addColumn(column: Column) {
    this.cols.push(column);
  }

  toMergedColumns() {
    const uniqueColIds = new Set();
    this.cols.forEach((col) => uniqueColIds.add(col.id));

    const results: { id: any; [key: string]: any }[] = [];

    Array.from(uniqueColIds).forEach((uniqueColId) => {
      const mergedCol = { id: uniqueColId };

      this.cols.forEach((col) => {
        if (col.id === uniqueColId) {
          mergedCol[col.name] = col.value;
        }
      });

      results.push(mergedCol);
    });

    return results;
  }

  toCSV(headerNames?: string[]): any[][] {
    const uniqueColumnNames: Set<string> = new Set();

    const rows = this.toMergedColumns();

    if (!headerNames) {
      rows.forEach((row) => Object.keys(row).forEach((key) => uniqueColumnNames.add(key)));
    }

    const headersToSortBy = headerNames || Array.from(uniqueColumnNames);

    const csvData: any[][] = [];

    rows.forEach((row, rowIndex) => {
      csvData[rowIndex] = [];

      Object.entries(row).forEach(([colKey, colValue]) => {
        const headerIndex = headersToSortBy.indexOf(colKey);

        if (headerIndex !== -1) {
          csvData[rowIndex][headerIndex] = colValue;
        }
      });
    });

    // Add headers array to the start of the array
    csvData.unshift(headersToSortBy);

    return csvData;
  }

  // toCSV(headerNames?: string[]): any[][] {
  //   const uniqueColumnNames: Set<string> = new Set();

  //   if (!headerNames) {
  //     // this.rows.forEach((row) => {
  //     row.forEach((column) => uniqueColumnNames.add(column.name));
  //     // });
  //   }

  //   const headersToSortBy = headerNames || Array.from(uniqueColumnNames);

  //   const csvData: any[][] = [];

  //   this.rows.forEach((row, rowIndex) => {
  //     csvData[rowIndex] = [];

  //     row.forEach((column) => {
  //       const headerIndex = headersToSortBy.indexOf(column.name);

  //       if (headerIndex !== -1) {
  //         csvData[rowIndex][headerIndex] = column.value;
  //       }
  //     });
  //   });

  //   // Add headers array to the start of the array
  //   csvData.unshift(headersToSortBy);

  //   return csvData;
  // }

  toBuffer(headerNames?: string[]): Buffer {
    const csvData = this.toCSV(headerNames);

    const newWorkbook = xlsx.utils.book_new();

    const newWorksheet = xlsx.utils.aoa_to_sheet(csvData);

    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, DEFAULT_XLSX_SHEET);

    return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' }) as Buffer;
  }
}

export class XLSXTransformationTarget {
  files: TargetFile[];

  constructor() {
    this.files = [
      new TargetFile('event'),
      new TargetFile('occurrence'),
      new TargetFile('measurementorfact'),
      new TargetFile('resourcerelationship'),
      new TargetFile('taxon')
    ];
  }

  hasFile(fileName: string): boolean {
    return this.files.some((file) => file.fileName === fileName);
  }

  getFileIndex(fileName: string): number {
    return this.files.findIndex((file) => file.fileName === fileName);
  }

  ensureFile(fileName: string) {
    if (this.hasFile(fileName)) {
      return;
    }

    this.addFile(fileName);
  }

  addFile(fileName: string) {
    this.files.push(new TargetFile(fileName));
  }

  // hasRow(fileIndex: number, rowIndex: number): boolean {
  //   return !!this.files[fileIndex].rows[rowIndex];
  // }

  // getCurrentRowIndex(fileIndex: number): number {
  //   return this.files[fileIndex].getCurrentRow();
  // }

  // addRow(fileIndex: number) {
  //   this.files[fileIndex].addRow();
  // }

  addColumn(fileIndex: number, column: Column) {
    this.files[fileIndex].cols.push(column);
  }

  hasColumn(fileIndex: number, column: Column) {
    this.files[fileIndex].hasColumn(column);
  }

  // hasCoreId(coreid: { file: 'string'; columns: string[] }): string | number {
  //   this.addFile(coreid.file);

  //   const fileIndex = this.getFileIndex(coreid.file);

  //   const id = coreid.columns.join(':');

  //   const hasColumn = this.files[fileIndex].hasColumn({ id: id, name: 'id', value: id });

  //   if (!hasColumn) {
  //     // this.files[fileIndex].addRow();
  //     this.files[fileIndex].addColumn({ id: id, name: 'id', value: id });
  //   }

  //   return id;
  // }
}

// export class XLSXTransformationTarget {
//   files: TargetFile[];

//   constructor() {
//     this.files = [
//       new TargetFile('event', []),
//       new TargetFile('occurrence', []),
//       new TargetFile('measurementorfact', []),
//       new TargetFile('resourcerelationship', []),
//       new TargetFile('taxon', [])
//     ];
//   }

//   hasFile(fileName: string): boolean {
//     return this.files.some((file) => file.fileName === fileName);
//   }

//   getFileIndex(fileName: string): number {
//     return this.files.findIndex((file) => file.fileName === fileName);
//   }

//   addFile(fileName: string, rows: Row[]) {
//     if (this.hasFile(fileName)) {
//       return;
//     }

//     this.files.push(new TargetFile(fileName, rows));
//   }

//   hasRow(fileName: string, rowIndex: number): boolean {
//     const fileIndex = this.getFileIndex(fileName);

//     return !!this.files[fileIndex].rows[rowIndex];
//   }

//   getCurrentRow(fileName: string): number {
//     if (!this.hasFile(fileName)) {
//       this.addFile(fileName, []);
//     }

//     const fileIndex = this.getFileIndex(fileName);

//     return this.files[fileIndex].getCurrentRow();
//   }

//   addRow(fileName: string, row: Row) {
//     if (!this.hasFile(fileName)) {
//       this.addFile(fileName, [row]);

//       return;
//     }

//     const fileIndex = this.getFileIndex(fileName);

//     this.files[fileIndex].rows.push(row);
//   }

//   addColumn(fileName: string, rowIndex: number, column: Column) {
//     if (!this.hasFile(fileName)) {
//       this.addFile(fileName, [[column]]);

//       return;
//     }

//     const fileIndex = this.getFileIndex(fileName);

//     if (!this.hasRow(fileName, rowIndex)) {
//       this.files[fileIndex].rows[rowIndex] = [];
//     }

//     this.files[fileIndex].rows[rowIndex].push(column);
//   }
// }
