import xlsx from 'xlsx';
import { IMediaState, MediaFile, MediaValidator } from '../../media-file';
import { CSVValidator, CSVWorksheet, ICsvState, IWorksheets } from '../csv-file';

export enum DWC_CLASS {
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship',
  TAXON = 'taxon',
  META = 'meta'
}

const DEFAULT_XLSX_SHEET = 'Sheet1';

export type DWCArchiveMediaValidationRules = {
  [key in DWC_CLASS]?: MediaValidator[];
};

export type DWCArchiveMediaContentValidationRules = {
  [key in DWC_CLASS]?: CSVValidator[];
};

/**
 * Supports Darwin Core Archive CSV files.
 *
 * Expects an array of known named-files
 *
 * @export
 * @class DWCArchive
 * @implements {IWorksheets}
 */
export class DWCArchive implements IWorksheets {
  rawFiles: MediaFile[];

  worksheets: { [name in DWC_CLASS]?: CSVWorksheet };

  extra: { [name: string]: any };

  constructor(files: MediaFile[]) {
    this.rawFiles = files;

    this.worksheets = {};
    this.extra = {};

    this._init();
  }

  _init() {
    for (const rawFile of this.rawFiles) {
      switch (rawFile.name) {
        case DWC_CLASS.EVENT:
          this.worksheets.event = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.OCCURRENCE:
          this.worksheets.occurrence = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.MEASUREMENTORFACT:
          this.worksheets.measurementorfact = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.RESOURCERELATIONSHIP:
          this.worksheets.resourcerelationship = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.TAXON:
          this.worksheets.taxon = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case DWC_CLASS.META:
          this.extra.meta = rawFile;
      }
    }
  }

  /**
   * Runs validation against the raw MediaFiles and their properties (does not validate their content).
   *
   * @return {*}  {IMediaState[]}
   * @memberof DWCArchive
   */
  isMediaValid(validationRules: DWCArchiveMediaValidationRules): IMediaState[] {
    const mediaState: IMediaState[] = [];

    for (const rawFile of this.rawFiles) {
      switch (rawFile.name) {
        case DWC_CLASS.EVENT:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.EVENT] || []).getState());
          break;
        case DWC_CLASS.OCCURRENCE:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.OCCURRENCE] || []).getState());
          break;
        case DWC_CLASS.MEASUREMENTORFACT:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.MEASUREMENTORFACT] || []).getState());
          break;
        case DWC_CLASS.RESOURCERELATIONSHIP:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.RESOURCERELATIONSHIP] || []).getState());
          break;
        case DWC_CLASS.TAXON:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.TAXON] || []).getState());
          break;
        case DWC_CLASS.META:
          mediaState.push(rawFile.validate(validationRules[DWC_CLASS.META] || []).getState());
      }
    }

    return mediaState;
  }

  isContentValid(validationRules: DWCArchiveMediaContentValidationRules): ICsvState[] {
    const csvState: ICsvState[] = [];

    if (this.worksheets.event) {
      csvState.push(this.worksheets.event.validate(validationRules[DWC_CLASS.EVENT] || []).getState());
    }

    if (this.worksheets.occurrence) {
      csvState.push(this.worksheets.occurrence.validate(validationRules[DWC_CLASS.OCCURRENCE] || []).getState());
    }

    if (this.worksheets.measurementorfact) {
      csvState.push(
        this.worksheets.measurementorfact.validate(validationRules[DWC_CLASS.MEASUREMENTORFACT] || []).getState()
      );
    }

    if (this.worksheets.resourcerelationship) {
      csvState.push(
        this.worksheets.resourcerelationship.validate(validationRules[DWC_CLASS.RESOURCERELATIONSHIP] || []).getState()
      );
    }

    if (this.worksheets.taxon) {
      csvState.push(this.worksheets.taxon.validate(validationRules[DWC_CLASS.TAXON] || []).getState());
    }

    return csvState;
  }
}
