import { expect } from 'chai';
import { describe } from 'mocha';
import xlsx from 'xlsx';
import { IMediaFile, MediaFile, MediaValidation } from '../media-file';
import { DEFAULT_XLSX_SHEET_NAME, XLSXCSV, XLSXCSVValidator } from '../xlsx/xlsx-file';
import {
  getFileEmptyValidator,
  getFileMimeTypeValidator,
  getRequiredFilesValidator
} from './file-type-and-content-validator';

describe('getFileEmptyValidator', () => {
  it('adds an error when the buffer is empty', () => {
    const validator = getFileEmptyValidator();

    const mediaFile: IMediaFile = {
      fileName: 'testName',
      mimetype: 'testMime',
      buffer: Buffer.from(''), // empty buffer
      mediaValidation: new MediaValidation('testName')
    };

    validator(mediaFile);

    expect(mediaFile.mediaValidation.fileErrors).to.eql(['File is empty']);
  });

  it('adds no errors when the buffer is not empty', () => {
    const validator = getFileEmptyValidator();

    const mediaFile: IMediaFile = {
      fileName: 'testName',
      mimetype: 'testMime',
      buffer: Buffer.from([123]), // non-empty buffer
      mediaValidation: new MediaValidation('testName')
    };

    validator(mediaFile);

    expect(mediaFile.mediaValidation.fileErrors).to.eql([]);
  });
});

describe('getFileMimeTypeValidator', () => {
  it('adds an error when the mime type is invalid', () => {
    const validMimetypes = {
      mimetype_validator: {
        reg_exps: ['validMime']
      }
    };

    const validator = getFileMimeTypeValidator(validMimetypes) as XLSXCSVValidator;

    const mediaFile = new MediaFile('testName', 'badMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql(['File mime type is invalid, must be one of: validMime']);
  });

  it('adds no errors when the mime type is valid', () => {
    const validMimetypes = {
      mimetype_validator: {
        reg_exps: ['validMime']
      }
    };

    const validator = getFileMimeTypeValidator(validMimetypes);

    const mediaFile = new MediaFile('otherName', 'otherMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql([]);
  });

  it('adds no errors when no valid mimes provided', () => {
    const validMimetypes = {
      mimetype_validator: {
        reg_exps: []
      }
    };

    const validator = getFileMimeTypeValidator(validMimetypes) as XLSXCSVValidator;

    const mediaFile = new MediaFile('testName', 'validMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql([]);
  });
});

describe('getRequiredFilesValidator', () => {
  it('adds no error an when the submitted file list is undefined', () => {
    const submissionRequiredFilesValidatorConfig = undefined;

    const validator = getRequiredFilesValidator(submissionRequiredFilesValidatorConfig) as XLSXCSVValidator;

    const mediaFile = new MediaFile('testName', 'validMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql([]);
  });

  it('adds no error an when the required file list is empty', () => {
    const submissionRequiredFilesValidatorConfig = {
      submission_required_files_validator: {
        required_files: []
      }
    };

    const validator = getRequiredFilesValidator(submissionRequiredFilesValidatorConfig) as XLSXCSVValidator;

    const mediaFile = new MediaFile('testName', 'validMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql([]);
  });

  it('checks that a submission is a valid XLSXCSV, and adds an error if a required file is missing', () => {
    const submissionRequiredFilesValidatorConfig = {
      submission_required_files_validator: {
        required_files: ['sheet2']
      }
    };

    const validator = getRequiredFilesValidator(submissionRequiredFilesValidatorConfig) as XLSXCSVValidator;

    const newWorkbook = xlsx.utils.book_new();

    const worksheet = xlsx.utils.aoa_to_sheet([[]]);

    xlsx.utils.book_append_sheet(newWorkbook, worksheet, DEFAULT_XLSX_SHEET_NAME);

    const mediaFile = new MediaFile('worksheet', 'validMime', Buffer.from(''));

    const xlsxCSV = new XLSXCSV(mediaFile);

    validator(xlsxCSV);

    expect(xlsxCSV.mediaValidation.fileErrors).to.eql(['Missing required sheet: sheet2']);
  });
});
