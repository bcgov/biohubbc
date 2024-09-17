import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { PassThrough } from 'stream';
import { ApiError } from '../../errors/api-error';
import * as file_utils from '../../utils/file-utils';
import { getMockDBConnection } from '../../__mocks__/db';
import { ExportService } from './export-service';
import { ExportConfig, ExportStrategy } from './export-strategy';
import * as export_utils from './export-utils';

chai.use(sinonChai);

describe('ExportService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('export', () => {
    it('throws an error if no export strategies are defined', async () => {
      // Setup
      const mockDBConnection = getMockDBConnection();

      const exportConfig: ExportConfig = {
        exportStrategies: [],
        s3Key: 'path/to/file/key'
      };

      // Execute
      const exportService = new ExportService(mockDBConnection);

      try {
        await exportService.export(exportConfig);

        expect.fail('Expected an error to be thrown');
      } catch (error) {
        // Assert
        expect((error as ApiError).message).to.equal('No export strategies have been defined.');
      }
    });

    it('exports data', async () => {
      // Setup

      // mock database client/connection
      const mockClient = {
        query: sinon.stub().resolves(),
        release: sinon.stub().resolves()
      };
      const mockDBConnection = getMockDBConnection({
        getClient: sinon.stub().resolves(mockClient)
      });

      // mock upload stream to s3
      const mockUploadResponse = {} as CompleteMultipartUploadCommandOutput;
      sinon.stub(file_utils, 'uploadStreamToS3').resolves(mockUploadResponse);

      // mock archive stream
      const archiveStream = export_utils.getArchiveStream();
      sinon.stub(archiveStream, 'pipe').returns(archiveStream);
      sinon.stub(archiveStream, 'append').returns(archiveStream);
      sinon.stub(archiveStream, 'finalize').resolves();
      sinon.stub(export_utils, 'getArchiveStream').returns(archiveStream);

      // mock s3 signed urls function
      sinon.stub(ExportService.prototype, '_getAllSignedURLs').resolves(['signed-url-for:path/to/file/key']);

      // Create mock export strategies
      const sqlExportStrategy: ExportStrategy = {
        getExportStrategyConfig: sinon.stub().resolves({
          queries: [
            {
              sql: SQL``,
              fileName: 'file1.csv'
            }
          ]
        })
      };

      const mockStream = new PassThrough();
      const streamExportStrategy: ExportStrategy = {
        getExportStrategyConfig: sinon.stub().resolves({
          streams: [
            {
              stream: sinon.stub().returns(mockStream),
              fileName: 'file2.csv'
            }
          ]
        })
      };

      const exportConfig: ExportConfig = {
        exportStrategies: [sqlExportStrategy, streamExportStrategy],
        s3Key: 'path/to/file/key'
      };

      // Execute
      const exportService = new ExportService(mockDBConnection);
      const signedUrls = await exportService.export(exportConfig);

      // Assert
      expect(signedUrls.length).to.equal(1);
      expect(signedUrls[0]).to.equal('signed-url-for:path/to/file/key');

      // Get export strategy config
      expect(sqlExportStrategy.getExportStrategyConfig).to.have.been.calledOnceWith(mockDBConnection);
      expect(streamExportStrategy.getExportStrategyConfig).to.have.been.calledOnceWith(mockDBConnection);
      // Append query strategy
      expect(archiveStream.append).to.have.been.calledWith(sinon.match.any, { name: 'file1.csv' });
      // Append stream strategy
      expect(archiveStream.append).to.have.been.calledWith(sinon.match.any, { name: 'file2.csv' });

      // Cleanup
      mockStream.destroy();
    });
  });
});
