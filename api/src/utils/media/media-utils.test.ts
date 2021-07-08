import AdmZip from 'adm-zip';
import { expect } from 'chai';
import { describe } from 'mocha';
import { MediaFile } from './media-file';
import { parseUnknownFile, parseUnknownMedia, parseUnknownZipFile } from './media-utils';

describe('parseUnknownMedia', () => {
  it('returns an array of MediaFile elements', () => {
    const multerFile = ({
      originalname: 'file1.txt',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = parseUnknownMedia(multerFile);

    expect(response.length).to.equal(1);
    expect(response[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
  });

  it('returns an array of MediaFile elements, when a zip file is provided', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = parseUnknownMedia(multerFile);

    expect(response.length).to.equal(2);
    expect(response[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
    expect(response[1]).to.eql(new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data')));
  });
});

describe('parseUnknownZipFile', () => {
  it('returns an array of MediaFile elements', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = parseUnknownZipFile(multerFile);

    expect(response.length).to.equal(2);
    expect(response[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
    expect(response[1]).to.eql(new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data')));
  });

  it('returns an empty array if the zip contains no files', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('folder2/', Buffer.from('')); // add folder

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = parseUnknownZipFile(multerFile);

    expect(response.length).to.equal(0);
  });
});

describe('parseUnknownFile', () => {
  it('returns a MediaFile item', () => {
    const multerFile = ({
      originalname: 'file1.csv',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = parseUnknownFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file mime type is unknown', () => {
    const multerFile = ({
      originalname: 'file1.notAKnownMimeTypecsv',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = parseUnknownFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file buffer is null', () => {
    const multerFile = ({
      originalname: 'file1.notAKnownMimeTypecsv',
      buffer: null
    } as unknown) as Express.Multer.File;

    const response = parseUnknownFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', (null as unknown) as Buffer));
  });
});
