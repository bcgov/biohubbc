import xlsx from 'xlsx';
import { IMediaState, MediaFile, MediaValidator } from '../../media-file';
import { CSVValidator, CSVWorksheet, ICsvState, IWorksheets } from '../csv-file';
import { XSLX_CLASS } from './xslx-validator';

const DEFAULT_XLSX_SHEET = 'Sheet1';

export type XSLXMediaValidationRules = {
  [key in XSLX_CLASS]?: MediaValidator[];
};

export type XSLXMediaContentValidationRules = {
  [key in XSLX_CLASS]?: CSVValidator[];
};

/**
 * Supports XSLX CSV files.
 *
 * Expects an array of known named-files
 *
 * @export
 * @class XSLX
 * @implements {IWorksheets}
 */
export class XSLX implements IWorksheets {
  rawFiles: MediaFile[];

  worksheets: { [name in XSLX_CLASS]?: CSVWorksheet };

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
        case XSLX_CLASS.SAMPLE_STATION_INFORMATION:
          this.worksheets['Sample Station Information'] = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case XSLX_CLASS.GENERAL_SURVEY:
          this.worksheets['General Survey'] = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
          break;
        case XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
          this.worksheets['Site & Incidental Observations'] = new CSVWorksheet(
            rawFile.fileName,
            xlsx.read(rawFile.buffer).Sheets[DEFAULT_XLSX_SHEET]
          );
      }
    }
  }

  /**
   * Runs validation against the raw MediaFiles and their properties (does not validate their content).
   *
   * @return {*}  {IMediaState[]}
   * @memberof XSLX
   */
  isMediaValid(validationRules: XSLXMediaValidationRules): IMediaState[] {
    const mediaState: IMediaState[] = [];

    for (const rawFile of this.rawFiles) {
      switch (rawFile.name) {
        case XSLX_CLASS.SAMPLE_STATION_INFORMATION:
          mediaState.push(rawFile.validate(validationRules[XSLX_CLASS.SAMPLE_STATION_INFORMATION] || []).getState());
          break;
        case XSLX_CLASS.GENERAL_SURVEY:
          mediaState.push(rawFile.validate(validationRules[XSLX_CLASS.GENERAL_SURVEY] || []).getState());
          break;
        case XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS:
          mediaState.push(rawFile.validate(validationRules[XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS] || []).getState());
      }
    }

    return mediaState;
  }

  isContentValid(validationRules: XSLXMediaContentValidationRules): ICsvState[] {
    const csvState: ICsvState[] = [];

    if (this.worksheets['Sample Station Information']) {
      csvState.push(
        this.worksheets['Sample Station Information']
          .validate(validationRules[XSLX_CLASS.SAMPLE_STATION_INFORMATION] || [])
          .getState()
      );
    }

    if (this.worksheets['General Survey']) {
      csvState.push(
        this.worksheets['General Survey'].validate(validationRules[XSLX_CLASS.GENERAL_SURVEY] || []).getState()
      );
    }

    if (this.worksheets['Site & Incidental Observations']) {
      csvState.push(
        this.worksheets['Site & Incidental Observations']
          .validate(validationRules[XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS] || [])
          .getState()
      );
    }

    return csvState;
  }
}
