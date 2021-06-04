import { CSVFile } from '../custom-file';

export interface IDWCArchive {
  event?: CSVFile;
  occurrence?: CSVFile;
  measurementorfact?: CSVFile;
  resourcerelationship?: CSVFile;
  meta?: CSVFile;
}

export class DWCArchive implements IDWCArchive {
  event?: CSVFile;
  occurrence?: CSVFile;
  measurementorfact?: CSVFile;
  resourcerelationship?: CSVFile;
  meta?: CSVFile;

  constructor() {
    this.event = undefined;
    this.occurrence = undefined;
    this.measurementorfact = undefined;
    this.resourcerelationship = undefined;
    this.meta = undefined;
  }
}
