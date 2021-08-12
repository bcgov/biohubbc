import AdmZip from 'adm-zip';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ArchiveFile, MediaFile } from './media-file';
import * as media_utils from './media-utils';

chai.use(sinonChai);

describe('parseUnknownMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('calls parseUnknownMulterFile', () => {
    const parseUnknownMulterFileStub = sinon.stub(media_utils, 'parseUnknownMulterFile');

    media_utils.parseUnknownMedia(({ originalname: 'name' } as unknown) as Express.Multer.File);

    expect(parseUnknownMulterFileStub).to.have.been.calledOnce;
  });

  it('calls parseUnknownS3File', () => {
    const parseUnknownS3FileStub = sinon.stub(media_utils, 'parseUnknownS3File');

    media_utils.parseUnknownMedia(({} as unknown) as GetObjectOutput);

    expect(parseUnknownS3FileStub).to.have.been.calledOnce;
  });
});

describe('parseUnknownMulterFile', () => {
  it('returns a MediaFile', () => {
    const multerFile = ({
      originalname: 'file1.txt',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = media_utils.parseUnknownMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
  });

  it('returns an ArchiveFile, when a zip file is provided', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = media_utils.parseUnknownMulterFile(multerFile);

    expect(response).to.eql(
      new ArchiveFile('zipFile.zip', 'application/zip', zipFile.toBuffer(), [
        new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')),
        new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data'))
      ])
    );
  });
});

describe('parseUnknownS3File', () => {
  it('returns a MediaFile', () => {
    const s3File = ({
      Metadata: { filename: 'file1.txt' },
      Body: Buffer.from('file1data')
    } as unknown) as GetObjectOutput;

    const response = media_utils.parseUnknownS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
  });

  it('returns an ArchiveFile, when a zip file is provided', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const s3File = ({
      Metadata: { filename: 'zipFile.zip' },
      ContentType: 'application/zip',
      Body: zipFile.toBuffer()
    } as unknown) as GetObjectOutput;

    const response = media_utils.parseUnknownS3File(s3File);

    expect(response).to.eql(
      new ArchiveFile('zipFile.zip', 'application/zip', zipFile.toBuffer(), [
        new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')),
        new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data'))
      ])
    );
  });
});

describe('parseUnknownZipFile', () => {
  it('returns an array of MediaFile elements', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = media_utils.parseUnknownZipFile(multerFile.buffer);

    expect(response.length).to.equal(2);
    expect(response[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
    expect(response[1]).to.eql(new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data')));
  });

  it('returns an empty array if the zip contains no files', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('folder2/', Buffer.from('')); // add folder

    const multerFile = ({ originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown) as Express.Multer.File;

    const response = media_utils.parseUnknownZipFile(multerFile.buffer);

    expect(response.length).to.equal(0);
  });
});

describe('parseMulterFile', () => {
  it('returns a MediaFile item', () => {
    const multerFile = ({
      originalname: 'file1.csv',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file mime type is unknown', () => {
    const multerFile = ({
      originalname: 'file1.notAKnownMimeTypecsv',
      buffer: Buffer.from('file1data')
    } as unknown) as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file buffer is null', () => {
    const multerFile = ({
      originalname: 'file1.csv',
      buffer: null
    } as unknown) as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', (null as unknown) as Buffer));
  });
});

describe('parseS3File', () => {
  it('returns a MediaFile item', () => {
    const s3File = ({
      Metadata: { filename: 'file1.csv' },
      ContentType: 'text/csv',
      Body: Buffer.from('file1data')
    } as unknown) as GetObjectOutput;

    const response = media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file mime type is unknown', () => {
    const s3File = ({
      Metadata: { filename: 'file1.notAKnownMimeTypecsv' },
      ContentType: 'notAKnownMimeTypecsv',
      Body: Buffer.from('file1data')
    } as unknown) as GetObjectOutput;

    const response = media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file buffer is null', () => {
    const s3File = ({
      Metadata: { filename: 'file1.csv' },
      ContentType: 'text/csv',
      Body: null
    } as unknown) as GetObjectOutput;

    const response = media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', (null as unknown) as Buffer));
  });
});
