// import xlsx from 'xlsx';
// import { DEFAULT_XLSX_SHEET } from '../../../../utils/media/dwc/dwc-archive-file';
import { XLSXCSV, XLSXCSVTransformer } from '../xlsx-file';

export type Column = {
  coreid: string | number;
  uniqueid: { name: string; value: string | number };
  name: string;
  value: string | number | undefined;
};

// type Row = Column[];

export class SourceFileTransformer {
  fileName: string;
  rawTransformers: XLSXCSVTransformer[];

  pivotedTransformers: XLSXCSVTransformer[][];

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

export type TargetFileRecord = { coreid: any; id: any; [key: string]: any };

export class EventFile {
  records: TargetFileRecord[] = [];

  toCSV() {
    return '';
  }

  addRecord(record: TargetFileRecord) {
    this.records.push(record);
  }
}
export class OccurrenceFile {
  records: TargetFileRecord[] = [];

  toCSV() {
    return '';
  }

  addRecord(record: TargetFileRecord) {
    this.records.push(record);
  }
}

export class ResourceRelationshipFile {
  records: TargetFileRecord[] = [];

  toCSV() {
    return '';
  }

  addRecord(resourceRecord: TargetFileRecord, relatedResourceRecord: TargetFileRecord) {
    this.records.push({ ...resourceRecord, relatedResourceID: relatedResourceRecord.id });
    this.records.push({ ...relatedResourceRecord, relatedResourceID: resourceRecord.id });
  }
}

// export class XLSXTransformationTarget {
//   event = new EventFile();
//   occurrence = new OccurrenceFile();
//   resourcerelationship = new ResourceRelationshipFile();
//   // measurementorfact: TargetFileRecord[] = [];
//   // taxon: TargetFileRecord[] = [];

//   // hasFile(fileName: string): boolean {
//   //   return this.files.some((file) => file.fileName === fileName);
//   // }

//   // getFileIndex(fileName: string): number {
//   //   return this.files.findIndex((file) => file.fileName === fileName);
//   // }

//   // ensureFile(fileName: string) {
//   //   if (this.hasFile(fileName)) {
//   //     return;
//   //   }

//   //   this.addFile(fileName);
//   // }

//   // addFile(fileName: string) {
//   //   this.files.push(new TargetFile(fileName));
//   // }

//   // addColumn(fileIndex: number, column: Column) {
//   //   this.files[fileIndex].cols.push(column);
//   // }

//   // hasColumn(fileIndex: number, column: Column) {
//   //   this.files[fileIndex].hasColumn(column);
//   // }

//   addEvent(record: TargetFileRecord) {
//     this.event.addRecord(record);
//   }

//   addOccurrence(record: TargetFileRecord) {
//     this.occurrence.addRecord(record);
//   }

//   addResourceRelationship(resourceRecord: TargetFileRecord, relatedResourceRecord: TargetFileRecord) {
//     this.resourcerelationship.addRecord(resourceRecord, relatedResourceRecord);
//   }
// }

export class TargetFile {
  fileName: string;

  cols: any[] = [];

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  hasColumn(columnName: any) {
    return columnName;
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

  addColumn(fileIndex: number, column: Column) {
    this.files[fileIndex].cols.push(column);
  }

  hasColumn(fileIndex: number, column: Column) {
    this.files[fileIndex].hasColumn(column);
  }
}
