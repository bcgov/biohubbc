type IndexFilterFunction = (file: File) => number;

type Column = { name: string; value: string | number | undefined };

type Row = Column[];

type File = { name: string; rows: Row[] };

export class XLSXTransformation {
  files: File[];

  constructor() {
    this.files = [
      { name: 'event', rows: [] },
      { name: 'occurrence', rows: [] },
      { name: 'measurementorfact', rows: [] },
      { name: 'resourcerelationship', rows: [] },
      { name: 'taxon', rows: [] }
    ];
  }

  hasFile(fileName: string): boolean {
    return this.files.some((file) => file.name === fileName);
  }

  getFileIndex(fileName: string): number {
    return this.files.findIndex((file) => file.name === fileName);
  }

  addFile(fileName: string, rows: Row[]) {
    if (this.hasFile(fileName)) {
      return;
    }

    this.files.push({ name: fileName, rows: rows });
  }

  addRow(fileName: string, row: Row) {
    if (!this.hasFile(fileName)) {
      this.addFile(fileName, [row]);

      return;
    }

    const fileIndex = this.getFileIndex(fileName);

    this.files[fileIndex].rows.push(row);
  }

  addColumn(fileName: string, rowIndex: number | IndexFilterFunction, column: Column) {
    if (!this.hasFile(fileName)) {
      this.addFile(fileName, [[column]]);

      return;
    }

    const fileIndex = this.getFileIndex(fileName);

    let _rowIndex = 0;
    if (typeof rowIndex !== 'number') {
      _rowIndex = rowIndex?.(this.files[fileIndex]);
    }

    this.files[fileIndex].rows[_rowIndex].push(column);
  }
}
