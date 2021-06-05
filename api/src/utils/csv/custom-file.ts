import AdmZip from 'adm-zip';
import mime from 'mime';
import Papa from 'papaparse';
import { CSVValidation } from './csv-validation';

export interface ICustomFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;
}

export class CustomFile implements ICustomFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;

  constructor(obj: Express.Multer.File | AdmZip.IZipEntry) {
    if ('originalname' in obj) {
      // parse fields from Express.Multer.File
      this.fileName = obj?.originalname;
      this.mimetype = mime.getType(this.fileName) || '';
      this.buffer = obj?.buffer;
    } else {
      // parse fields from AdmZip.IZipEntry
      this.fileName = obj?.name;
      this.mimetype = mime.getType(this.fileName) || '';
      this.buffer = obj?.getData();
    }
  }
}

export interface ICSVFileJSON {
  fileName: string;
  mimetype: string;
  data: string[][];
}

export class CSVFile implements ICustomFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;

  _isBufferParsed: boolean;
  _parsedBuffer: string[][];

  _headers: string[];
  _rows: string[][];

  csvValidation: CSVValidation;

  constructor(obj: CustomFile) {
    this.fileName = obj.fileName;
    this.mimetype = obj.mimetype;
    this.buffer = obj.buffer;

    this._isBufferParsed = false;
    this._parsedBuffer = [];

    this._headers = [];
    this._rows = [];

    this.csvValidation = new CSVValidation(this.fileName);
  }

  _parseBuffer(options?: Papa.ParseConfig<string[]>) {
    if (this._isBufferParsed && !options) {
      return;
    }

    const parseResult = Papa.parse(this.buffer.toString(), { skipEmptyLines: true, ...options });

    this._parsedBuffer = parseResult.data;

    this._headers = parseResult.data[0];

    this._rows = parseResult.data.slice(1, parseResult.data.length - 1);

    this.csvValidation.setRowErrors(parseResult.errors);

    this._isBufferParsed = true;
  }

  getHeaders(options?: Papa.ParseConfig<string[]>): string[] {
    this._parseBuffer(options);

    return this._headers;
  }

  getRows(options?: Papa.ParseConfig<string[]>): string[][] {
    this._parseBuffer(options);

    return this._rows;
  }

  toJSON(options?: Papa.ParseConfig<string[]>): ICSVFileJSON {
    this._parseBuffer(options);

    return { fileName: this.fileName, mimetype: this.mimetype, data: this._parsedBuffer };
  }
}
