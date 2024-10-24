import { expect } from 'chai';
import sinon from 'sinon';
import { MediaFile } from '../../../utils/media/media-file';
import * as worksheetUtils from '../../../utils/xlsx-utils/worksheet-utils';
import { getMockDBConnection } from '../../../__mocks__/db';
import { importCSV } from '../import-csv';
import { ImportTelemetryStrategy } from './import-telemetry-strategy';

describe('import-telemetry-strategy', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('importCSV telemetry worksheet', () => {
    it('should validate successfully', async () => {
      const worksheet = {
        A1: { t: 's', v: 'VENDOR' },
        B1: { t: 's', v: 'SERIAL' },
        C1: { t: 's', v: 'LATITUDE' },
        D1: { t: 's', v: 'LONGITUDE' },
        E1: { t: 's', v: 'DATE' },
        F1: { t: 's', v: 'TIME' },

        A2: { t: 's', v: 'lotek' },
        B2: { t: 'n', w: '1234', v: 1234 },
        C2: { t: 'n', w: '2', v: 2 },
        D2: { t: 'n', w: '2', v: 2 },
        E2: { z: 'm/d/yy', t: 'd', v: '2024-10-31', w: '10/31/24' },
        F2: { t: 's', v: '10:10:10' },

        A3: { t: 's', v: 'lotek' },
        B3: { t: 'n', w: '1234', v: 1234 },
        C3: { t: 'n', w: '30', v: 30 },
        D3: { t: 'n', w: '30', v: 30 },
        E3: { z: 'm/d/yy', t: 'd', v: '2024-10-31', w: '10/31/24' },

        '!ref': 'A1:F3'
      };

      const mockDBConnection = getMockDBConnection();

      const importTelemetryStrategy = new ImportTelemetryStrategy(mockDBConnection, 1);

      sinon.stub(worksheetUtils, 'getDefaultWorksheet').returns(worksheet);

      sinon
        .stub(importTelemetryStrategy.telemetryVendorService.deploymentService, 'getDeploymentsForSurveyId')
        .resolves([
          {
            deployment2_id: 1,
            device_key: 'lotek:1234',
            attachment_start_timestamp: '2024-10-21 10:10:10',
            attachment_end_timestamp: null
          }
        ] as any);

      sinon.stub(importTelemetryStrategy.telemetryVendorService, 'bulkCreateManualTelemetry').resolves();

      try {
        await importCSV(new MediaFile('test', 'test', 'test' as unknown as Buffer), importTelemetryStrategy);
      } catch (err: any) {
        expect.fail();
      }
    });
  });
});
