import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING,
  TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE
} from '../../constants/attachments';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { getMockDBConnection } from '../../__mocks__/db';
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

    expect(response.filesArray.length).to.equal(2);
    expect(response.filesArray[0]).to.eql(new MediaFile('file1.txt', 'text/plain', Buffer.from('file1data')));
    expect(response.filesArray[1]).to.eql(new MediaFile('file2.csv', 'text/csv', Buffer.from('file2data')));
  });

  it('returns an empty array if the zip contains no files', () => {
    const zipFile = new AdmZip();

    zipFile.addFile('folder2/', Buffer.from('')); // add folder

    const multerFile = { originalname: 'zipFile.zip', buffer: zipFile.toBuffer() } as unknown as Express.Multer.File;

    const response = media_utils.parseUnknownZipFile(multerFile.buffer);

    expect(response.filesArray.length).to.equal(0);
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

describe('checkFileForZip', () => {
  it('should return error if the file is an empty zip file', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const emptyZipFile = new AdmZip();
    const multerFile = { ...zipFile, buffer: emptyZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.ARCHIVE_WITH_NO_FILES
    });
  });

  it('should return error if the zip file has invalid mimetype', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/x-7z-compressed',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.keyx', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.FILE_INVALID_MIMETYPE
    });
  });

  it('should return error if the zip file contains any non .keyx or .cfg files', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.txt', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_ZIP_CONTENT
    });
  });

  it('should return error if the zip file contains only .keyx files with invalid XML', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile('test.keyx', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };
    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error: 'Invalid key file in ZIP: test.keyx, InvalidXml, Start tag expected.'
    });
  });

  it('should return error if the zip file contains only .keyx files with valid XML but bad tags', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile('test.keyx', Buffer.from('<data><test try="1"/></data>', 'utf-8'));
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error: 'Invalid key file in ZIP: test.keyx, Missing one or more required tags'
    });
  });

  it('should return error if the zip file contains only .cfg files with invalid key format', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile(
      'test.cfg',
      Buffer.from('[888888]\nKey=uuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111', 'utf-8')
    );
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      error: "Invalid key file in ZIP: test.cfg, Invalid 'Key' in key 1. Expected 64 characters."
    });
  });

  it('should return error if the zip file contains only .cfg files with invalid IMEI format', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const invalidZipFile = new AdmZip();
    invalidZipFile.addFile(
      'test.cfg',
      Buffer.from(
        '[888888]\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=abc',
        'utf-8'
      )
    );
    const multerFile = { ...zipFile, buffer: invalidZipFile.toBuffer() };
    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      error: "Invalid key file in ZIP: test.cfg, Invalid 'Iridium IMEI' length in key 1. Expected a 15-digit number."
    });
  });

  it('should return error if the Zip file contains a mix cfg and keyx files', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const mixedZipFile = new AdmZip();
    mixedZipFile.addFile('test.keyx', Buffer.alloc(0));
    mixedZipFile.addFile('test.cfg', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: mixedZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_ZIP_CONTENT
    });
  });

  it('should return error in response JSON of the first invalid .cfg file in the zip file', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const badCfgZipFile = new AdmZip();
    badCfgZipFile.addFile('test1.cfg', Buffer.alloc(0));
    badCfgZipFile.addFile('test2.cfg', Buffer.alloc(0));
    const multerFile = { ...zipFile, buffer: badCfgZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      error: 'Invalid key file in ZIP: test1.cfg, Key 1 must contain exactly 3 non-empty lines.'
    });
  });

  it('should return keyData in response JSON for each file if the zip file contains only valid .cfg files', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const zipFile = {
      originalname: 'test.zip',
      mimetype: 'application/zip',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const validZipFile = new AdmZip();
    validZipFile.addFile(
      'test1.cfg',
      Buffer.from(
        '[888888]\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111',
        'utf-8'
      )
    );
    validZipFile.addFile(
      'test2.cfg',
      Buffer.from(
        '[222222]\nKey=abBBBBBBBddddddddddddddddddddiiiiiiiidddddddjkhjhvhjgvhvg^nn@feE\nIridium IMEI=222222222222222',
        'utf-8'
      )
    );
    const multerFile = { ...zipFile, buffer: validZipFile.toBuffer() };

    expect(await media_utils.checkFileForZip(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      keyData: [
        {
          fileName: 'test1.cfg',
          keysData: [
            {
              id: 888888,
              key: 'd`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE',
              'Iridium IMEI': 111111111111111
            }
          ]
        },
        {
          fileName: 'test2.cfg',
          keysData: [
            {
              id: 222222,
              key: 'abBBBBBBBddddddddddddddddddddiiiiiiiidddddddjkhjhvhjgvhvg^nn@feE',
              'Iridium IMEI': 222222222222222
            }
          ]
        }
      ]
    });
  });
});

describe('checkFileForKeyx', () => {
  it('should return error because the key is not registred on the vectronic side', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const invalidKeyxFile = {
      originalname: 'test.keyx',
      mimetype: 'application/octet-stream',
      buffer: Buffer.from(
        '<?xml version="1.0" encoding="utf-8"?><collarKey><collar ID="12345"><comIDList><comID comType="Paladium">888888888888888</comID></comIDList><key>ABCDEF1234567890ABCDEF1234567890</key><collarType>333</collarType></collar></collarKey>',
        'utf-8'
      )
    } as unknown as Express.Multer.File;

    expect(await media_utils.checkFileForKeyx(invalidKeyxFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error:
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE +
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND
    });
  });

  it('should return error if the file is not a .keyx', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };

    expect(await media_utils.checkFileForKeyx(multerFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: 'File type is not a .keyx'
    });
  });

  it('should return error key XML file does not contain expected tags ', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const invalidKeyxFile = {
      originalname: 'test.keyx',
      mimetype: 'application/octet-stream',
      buffer: Buffer.from('<?xml version="1.0" encoding="utf-8"?><collarKey></collarKey>', 'utf-8')
    } as unknown as Express.Multer.File;

    expect(await media_utils.checkFileForKeyx(invalidKeyxFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error:
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE +
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.MISSING_XML_TAGS
    });
  });

  it('should return error with invalid xml in .keyx', async () => {
    const service = new TelemetryVectronicService(getMockDBConnection());
    const validKeyxFile = {
      originalname: 'test.keyx',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(await media_utils.checkFileForKeyx(validKeyxFile, service)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE + 'InvalidXml, Start tag expected.'
    });
  });
});

describe('checkFileForCfg', () => {
  it('should return file type CFG and keyData JSON from the key', () => {
    const validCfgFile = {
      originalname: 'test.cfg',
      mimetype: 'application/octet-stream',
      buffer: Buffer.from(
        '[888888]\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111',
        'utf-8'
      )
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForCfg(validCfgFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      keyData: [
        {
          fileName: 'test.cfg',
          keysData: [
            {
              id: 888888,
              key: 'd`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE',
              'Iridium IMEI': 111111111111111
            }
          ]
        }
      ]
    });
  });

  it('should return error if the .cfg is malformed', () => {
    const validCfgFile = {
      originalname: 'test.cfg',
      mimetype: 'application/octet-stream',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForCfg(validCfgFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      error: 'Key 1 must contain exactly 3 non-empty lines.'
    });
  });

  it('should return error if the cfg key has an invalid ID', () => {
    const invalidCfgFile = {
      originalname: 'test.cfg',
      mimetype: 'application/octet-stream',
      buffer: Buffer.from(
        '[sadasd]\n\nKey=d`qwertydisosososososohehuuuuuuuuuuuuuuuuc~[]hhhhhhhhhhhh^gg@frE\nIridium IMEI=111111111111111',
        'utf-8'
      )
    } as unknown as Express.Multer.File;

    expect(media_utils.checkFileForCfg(invalidCfgFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      error: 'Invalid ID in key 1. Valid format: [number].'
    });
  });

  it('should return error if the file is not a .cfg', () => {
    const invalidFile = {
      originalname: 'test.txt',
      mimetype: 'text/plain',
      buffer: Buffer.alloc(0)
    } as unknown as Express.Multer.File;

    const multerFile = { ...invalidFile, buffer: Buffer.alloc(0) };

    expect(media_utils.checkFileForCfg(multerFile)).to.eql({
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.FILE_NOT_CFG
    });
  });
});
