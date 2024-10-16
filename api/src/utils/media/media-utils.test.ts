import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE } from '../../constants/attachments';
import { ArchiveFile, MediaFile } from './media-file';
import * as media_utils from './media-utils';

chai.use(sinonChai);

describe('parseUnknownMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('calls parseUnknownMulterFile', async () => {
    const parseUnknownMulterFileStub = sinon.stub(media_utils, 'parseUnknownMulterFile');

    await media_utils.parseUnknownMedia({ originalname: 'name' } as unknown as Express.Multer.File);

    expect(parseUnknownMulterFileStub).to.have.been.calledOnce;
  });

  it('calls parseUnknownS3File', async () => {
    const parseUnknownS3FileStub = sinon.stub(media_utils, 'parseUnknownS3File');

    await media_utils.parseUnknownMedia({} as unknown as GetObjectCommandOutput);

    expect(parseUnknownS3FileStub).to.have.been.calledOnce;
  });
});

describe('parseUnknownMulterFile', () => {
  it('returns a MediaFile', () => {
    const multerFile = {
      originalname: 'file1.txt',
      buffer: Buffer.from('file1data')
    } as unknown as Express.Multer.File;

    const response = media_utils.parseUnknownMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
  });

  it('returns an ArchiveFile, when a zip file is provided', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const multerFile = { originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown as Express.Multer.File;

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
  it('returns a MediaFile', async () => {
    const s3File: GetObjectCommandOutput = {
      Metadata: { filename: 'file1.txt' },
      Body: {
        transformToByteArray: sinon.stub().resolves(Buffer.from('file1data'))
      }
    } as unknown as GetObjectCommandOutput;

    const response = await media_utils.parseUnknownS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
  });

  it('returns an ArchiveFile, when a zip file is provided', async () => {
    const zipFile = new AdmZip();

    zipFile.addFile('file1.txt', Buffer.from('file1data'));
    zipFile.addFile('folder2/', Buffer.from('')); // add folder
    zipFile.addFile('folder2/file2.csv', Buffer.from('file2data'));

    const s3File = {
      Metadata: { filename: 'zipFile.zip' },
      ContentType: 'application/zip',
      Body: {
        transformToByteArray: sinon.stub().resolves(zipFile.toBuffer())
      }
    } as unknown as GetObjectCommandOutput;

    const response = await media_utils.parseUnknownS3File(s3File);

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

    const multerFile = { originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown as Express.Multer.File;

    const response = media_utils.parseUnknownZipFile(multerFile.buffer);

    expect(response.length).to.equal(2);
    expect(response[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
    expect(response[1]).to.eql(new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data')));
  });

  it('returns an empty array if the zip contains no files', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('folder2/', Buffer.from('')); // add folder

    const multerFile = { originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown as Express.Multer.File;

    const response = media_utils.parseUnknownZipFile(multerFile.buffer);

    expect(response.length).to.equal(0);
  });
});

describe('parseMulterFile', () => {
  it('returns a MediaFile item', () => {
    const multerFile = {
      originalname: 'file1.csv',
      buffer: Buffer.from('file1data')
    } as unknown as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file mime type is unknown', () => {
    const multerFile = {
      originalname: 'file1.notAKnownMimeTypecsv',
      buffer: Buffer.from('file1data')
    } as unknown as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file buffer is null', () => {
    const multerFile = {
      originalname: 'file1.csv',
      buffer: null
    } as unknown as Express.Multer.File;

    const response = media_utils.parseMulterFile(multerFile);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', null as unknown as Buffer));
  });
});

describe('parseS3File', () => {
  it('returns a MediaFile item', async () => {
    const s3File = {
      Metadata: { filename: 'file1.csv' },
      ContentType: 'text/csv',
      Body: {
        transformToByteArray: sinon.stub().resolves(Buffer.from('file1data'))
      }
    } as unknown as GetObjectCommandOutput;

    const response = await media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file mime type is unknown', async () => {
    const s3File = {
      Metadata: { filename: 'file1.notAKnownMimeTypecsv' },
      ContentType: 'notAKnownMimeTypecsv',
      Body: {
        transformToByteArray: sinon.stub().resolves(Buffer.from('file1data'))
      }
    } as unknown as GetObjectCommandOutput;

    const response = await media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.notAKnownMimeTypecsv', '', Buffer.from('file1data')));
  });

  it('returns a MediaFile item when the file buffer is null', async () => {
    const s3File = {
      Metadata: { filename: 'file1.csv' },
      ContentType: 'text/csv',
      Body: {
        transformToByteArray: sinon.stub().resolves(null)
      }
    } as unknown as GetObjectCommandOutput;

    const response = await media_utils.parseS3File(s3File);

    expect(response).to.eql(new MediaFile('file1.csv', 'text/csv', null as unknown as Buffer));
  });
});

describe('isValidTelementryCredentialFile', () => {
  it('should return true if the file extension is .keyx', () => {
    const validKeyxFile = {
      originalname: 'test.keyx',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForKeyx(validKeyxFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX
    });
  });

  it('should return false if the file is not a .keyx or zip mimetype', () => {
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is neither a .keyx file, nor an archive containing only .keyx files'
    });
  });

  it('should return false if the file is an empty zip file', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const emptyZipFile = new AdmZip();
    const multerFile = { ...zipFile, buffer: emptyZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains no content'
    });
  });

  it('should return false if the zip file contains any non .keyx files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.txt', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains non .keyx files'
    });
  });

  it('should return true if the zip file contains only .keyx files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile('test.keyx', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX
    });
  });

  it('should return true if the file extension is .cfg', () => {
    const validCfgFile = {
      originalname: 'test.cfg',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForCfg(validCfgFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG
    });
  });

  it('should return false if the file is not a .cfg or zip mimetype', () => {
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is neither a .cfg file, nor an archive containing only .cfg files'
    });
  });

  it('should return false if the file is an empty zip file', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const emptyZipFile = new AdmZip();
    const multerFile = { ...zipFile, buffer: emptyZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains no content'
    });
  });

  it('should return false if the zip file contains any non .cfg files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.txt', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains non .cfg files'
    });
  });

  it('should return true if the zip file contains only .cfg files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile('test.cfg', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG
    });
  });
});

describe('checkFileForKeyx', () => {
  it('should return true if the file extension is .keyx', () => {
    const validKeyxFile = {
      originalname: 'test.keyx',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForKeyx(validKeyxFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX
    });
  });

  it('should return false if the file is not a .keyx or zip mimetype', () => {
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is neither a .keyx file, nor an archive containing only .keyx files'
    });
  });

  it('should return false if the file is an empty zip file', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const emptyZipFile = new AdmZip();
    const multerFile = { ...zipFile, buffer: emptyZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains no content'
    });
  });

  it('should return false if the zip file contains any non .keyx files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.txt', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains non .keyx files'
    });
  });

  it('should return true if the zip file contains only .keyx files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile('test.keyx', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };
    expect(media_utils.checkFileForKeyx(multerFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX
    });
  });
});

describe('checkFileForCfg', () => {
  it('should return true if the file extension is .cfg', () => {
    const validCfgFile = {
      originalname: 'test.cfg',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForCfg(validCfgFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG
    });
  });

  it('should return false if the file is not a .cfg or zip mimetype', () => {
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is neither a .cfg file, nor an archive containing only .cfg files'
    });
  });

  it('should return false if the file is an empty zip file', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const emptyZipFile = new AdmZip();
    const multerFile = { ...zipFile, buffer: emptyZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains no content'
    });
  });

  it('should return false if the zip file contains any non .cfg files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.txt', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: 'unknown',
      error: 'File is an archive that contains non .cfg files'
    });
  });

  it('should return true if the zip file contains only .cfg files', () => {
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile('test.cfg', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };
    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG
    });
  });
});
