import Papa from 'papaparse';
import { CSVFile, ICSVFileJSON } from '../custom-file';

export interface IDWCArchive {
  event?: CSVFile;
  occurrence?: CSVFile;
  measurementorfact?: CSVFile;
  resourcerelationship?: CSVFile;
  meta?: CSVFile;
}

export interface IDWCArchiveJSON {
  event: ICSVFileJSON | undefined;
  occurrence: ICSVFileJSON | undefined;
  measurementorfact: ICSVFileJSON | undefined;
  resourcerelationship: ICSVFileJSON | undefined;
}
export class DWCArchive implements IDWCArchive {
  event?: CSVFile;
  occurrence?: CSVFile;
  measurementorfact?: CSVFile;
  resourcerelationship?: CSVFile;
  meta?: any;

  constructor() {
    this.event = undefined;
    this.occurrence = undefined;
    this.measurementorfact = undefined;
    this.resourcerelationship = undefined;
    this.meta = undefined;
  }

  toJSON(options?: Papa.ParseConfig<string[]>): IDWCArchiveJSON {
    return {
      event: this.event?.toJSON(options),
      occurrence: this.occurrence?.toJSON(options),
      measurementorfact: this.measurementorfact?.toJSON(options),
      resourcerelationship: this.resourcerelationship?.toJSON(options)
    };
  }
}
