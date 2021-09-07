import { expect } from 'chai';
import { describe } from 'mocha';
import { IMediaFile, MediaValidation } from '../media-file';
import { getFileEmptyValidator, getFileMimeTypeValidator } from './file-type-and-content-validator';

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

    const validator = getFileMimeTypeValidator(validMimetypes);

    const mediaFile: IMediaFile = {
      fileName: 'testName',
      mimetype: 'badMime', // invalid mime
      buffer: Buffer.from(''),
      mediaValidation: new MediaValidation('testName')
    };

    validator(mediaFile);

    expect(mediaFile.mediaValidation.fileErrors).to.eql(['File mime type is invalid, must be one of: validMime']);
  });

  it('adds no errors when the mime type is valid', () => {
    const validMimetypes = {
      mimetype_validator: {
        reg_exps: ['validMime']
      }
    };

    const validator = getFileMimeTypeValidator(validMimetypes);
    const mediaFile: IMediaFile = {
      fileName: 'testName',
      mimetype: 'validMime', // valid mime
      buffer: Buffer.from(''),
      mediaValidation: new MediaValidation('testName')
    };

    validator(mediaFile);

    expect(mediaFile.mediaValidation.fileErrors).to.eql([]);
  });

  it('adds no errors when no valid mimes provided', () => {
    const validMimetypes = {
      mimetype_validator: {
        reg_exps: []
      }
    };

    const validator = getFileMimeTypeValidator(validMimetypes);
    const mediaFile: IMediaFile = {
      fileName: 'testName',
      mimetype: 'validMime',
      buffer: Buffer.from(''),
      mediaValidation: new MediaValidation('testName')
    };

    validator(mediaFile);

    expect(mediaFile.mediaValidation.fileErrors).to.eql([]);
  });
});
