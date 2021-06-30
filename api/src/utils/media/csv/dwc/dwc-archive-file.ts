import xlsx from 'xlsx';
import { IMediaState, MediaFile } from '../../media-file';
import { getFileEmptyValidator, getFileMimeTypeValidator } from '../../validation/file-type-and-content-validator';
import { CSVWorksheet, IWorksheets } from '../csv-file';

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
    for (let i = 0; i < this.rawFiles.length; i++) {
      if (/^event\.\w+$/.test(this.rawFiles[i].fileName)) {
        this.worksheets.event = new CSVWorksheet(
          this.rawFiles[i].fileName,
          xlsx.read(this.rawFiles[i].buffer).Sheets['Sheet1']
        );

        continue;
      }

      if (/^occurrence\.\w+$/.test(this.rawFiles[i].fileName)) {
        this.worksheets.occurrence = new CSVWorksheet(
          this.rawFiles[i].fileName,
          xlsx.read(this.rawFiles[i].buffer).Sheets['Sheet1']
        );

        continue;
      }

      if (/^measurementorfact\.\w+$/.test(this.rawFiles[i].fileName)) {
        this.worksheets.measurementorfact = new CSVWorksheet(
          this.rawFiles[i].fileName,
          xlsx.read(this.rawFiles[i].buffer).Sheets['Sheet1']
        );

        continue;
      }

      if (/^resourcerelationship\.\w+$/.test(this.rawFiles[i].fileName)) {
        this.worksheets.resourcerelationship = new CSVWorksheet(
          this.rawFiles[i].fileName,
          xlsx.read(this.rawFiles[i].buffer).Sheets['Sheet1']
        );

        continue;
      }

      if (/^meta\.\w+$/.test(this.rawFiles[i].fileName)) {
        this.extra.meta = this.rawFiles[i];

        continue;
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
