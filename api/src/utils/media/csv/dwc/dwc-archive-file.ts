import xlsx from 'xlsx';
import { IMediaState, MediaFile } from '../../media-file';
import { getFileEmptyValidator, getFileMimeTypeValidator } from '../../validation/file-type-and-content-validator';
import { CSVWorksheet, IWorksheets } from '../csv-file';

const DEFAULT_XLSX_SHEET = 'Sheet1';

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

  worksheets: { [name: string]: CSVWorksheet };

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
        case 'event':
          this.worksheets.event = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case 'occurrence':
          this.worksheets.occurrence = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case 'measurementorfact':
          this.worksheets.measurementorfact = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case 'resourcerelationship':
          this.worksheets.resourcerelationship = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case 'taxon':
          this.worksheets.taxon = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case 'meta':
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
  isValid(): IMediaState[] {
    const mediaState: IMediaState[] = [];

    this.rawFiles.forEach((rawFile) => {
      if (rawFile.fileName === 'meta.xml') {
        mediaState.push(
          rawFile.validate([getFileEmptyValidator(), getFileMimeTypeValidator([/application\/xml/])]).getState()
        );
      } else {
        mediaState.push(
          rawFile.validate([getFileEmptyValidator(), getFileMimeTypeValidator([/text\/plain/, /text\/csv/])]).getState()
        );
      }
    });

    return mediaState;
  }
}
