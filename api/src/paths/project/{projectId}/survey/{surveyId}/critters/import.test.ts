import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { ImportCrittersService } from '../../../../../../services/import-services/critter/import-critters-service';
import { parseMulterFile } from '../../../../../../utils/media/media-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { importCsv } from './import';

import * as fileUtils from '../../../../../../utils/file-utils';

describe('importCsv', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns imported critters', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCsv = sinon.stub(ImportCrittersService.prototype, 'import').resolves([1, 2]);
    const mockFileScan = sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockFileScan).to.have.been.calledOnceWithExactly(mockFile);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockImportCsv).to.have.been.calledOnceWithExactly(1, parseMulterFile(mockFile));
    expect(mockRes.json).to.have.been.calledOnceWithExactly({ survey_critter_ids: [1, 2] });

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should catch error and rollback if no files in request', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCsv = sinon.stub(ImportCrittersService.prototype, 'import').resolves([1, 2]);
    const mockFileScan = sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.equal('Invalid number of files included. Expected 1 CSV file.');
    }

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockFileScan).to.not.have.been.calledOnce;

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockImportCsv).to.not.have.been.called;
    expect(mockRes.json).to.not.have.been.called;

    expect(mockDBConnection.rollback).to.have.been.called;
    expect(mockDBConnection.commit).to.not.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });

  it('should catch error and rollback if more than 1 file in request', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCsv = sinon.stub(ImportCrittersService.prototype, 'import').resolves([1, 2]);
    const mockFileScan = sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

    const mockFile = { originalname: 'test.csv', mimetype: 'test.csv', buffer: Buffer.alloc(1) } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile, mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.be.equal('Invalid number of files included. Expected 1 CSV file.');
    }

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockFileScan).to.not.have.been.calledOnce;

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockImportCsv).to.not.have.been.called;
    expect(mockRes.json).to.not.have.been.called;

    expect(mockDBConnection.rollback).to.have.been.called;
    expect(mockDBConnection.commit).to.not.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });

  it('should catch error and rollback if file is not a csv', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCsv = sinon.stub(ImportCrittersService.prototype, 'import').resolves([1, 2]);
    const mockFileScan = sinon.stub(fileUtils, 'scanFileForVirus').resolves(true);

    const mockFile = {
      originalname: 'test.oops',
      mimetype: 'test.oops',
      buffer: Buffer.alloc(1)
    } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err: any) {
      expect(err).to.be.instanceof(HTTP400);
      expect(err.message).to.be.contains('Invalid file type.');
    }

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockFileScan).to.not.have.been.calledOnce;

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockImportCsv).to.not.have.been.called;
    expect(mockRes.json).to.not.have.been.called;

    expect(mockDBConnection.rollback).to.have.been.called;
    expect(mockDBConnection.commit).to.not.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });

  it('should catch error and rollback if file contains malware', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockImportCsv = sinon.stub(ImportCrittersService.prototype, 'import').resolves([1, 2]);

    const mockFileScan = sinon.stub(fileUtils, 'scanFileForVirus').resolves(false);

    const mockFile = {
      originalname: 'test.csv',
      mimetype: 'test.csv',
      buffer: Buffer.alloc(1)
    } as Express.Multer.File;

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile];
    mockReq.params.surveyId = '1';

    const requestHandler = importCsv();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err: any) {
      expect(err).to.be.instanceof(HTTP400);
      expect(err.message).to.be.contains('Malicious content detected');
    }

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockFileScan).to.have.been.calledOnceWithExactly(mockFile);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockImportCsv).to.not.have.been.called;
    expect(mockRes.json).to.not.have.been.called;

    expect(mockDBConnection.rollback).to.have.been.called;
    expect(mockDBConnection.commit).to.not.have.been.called;
    expect(mockDBConnection.release).to.have.been.called;
  });
});
