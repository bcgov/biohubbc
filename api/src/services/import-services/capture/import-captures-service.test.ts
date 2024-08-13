import { expect } from 'chai';
import sinon from 'sinon';
import { MediaFile } from '../../../utils/media/media-file';
import * as worksheetUtils from '../../../utils/xlsx-utils/worksheet-utils';
import { getMockDBConnection } from '../../../__mocks__/db';
import { IBulkCreateResponse, ICritterDetailed } from '../../critterbase-service';
import { importCSV } from '../csv-import-strategy';
import { ImportCapturesService } from './import-captures-service';

describe('import-captures-service', () => {
  describe('importCSV capture worksheet', () => {
    it('should validate successfully', async () => {
      const worksheet = {
        A1: { t: 's', v: 'CAPTURE_DATE' },
        B1: { t: 's', v: 'NICKNAME' },
        C1: { t: 's', v: 'CAPTURE_TIME' },
        D1: { t: 's', v: 'CAPTURE_LATITUDE' },
        E1: { t: 's', v: 'CAPTURE_LONGITUDE' },
        F1: { t: 's', v: 'RELEASE_DATE' },
        G1: { t: 's', v: 'RELEASE_TIME' },
        H1: { t: 's', v: 'RELEASE_LATITUDE' },
        I1: { t: 's', v: 'RELEASE_LONGITUDE' },
        J1: { t: 's', v: 'RELEASE_COMMENT' },
        K1: { t: 's', v: 'CAPTURE_COMMENT' },
        A2: { z: 'm/d/yy', t: 'd', v: '2024-10-10T07:00:00.000Z', w: '10/10/24' },
        B2: { t: 's', v: 'Carl' },
        C2: { t: 's', v: '10:10:10' },
        D2: { t: 'n', w: '90', v: 90 },
        E2: { t: 'n', w: '100', v: 100 },
        F2: { z: 'm/d/yy', t: 'd', v: '2024-10-10T07:00:00.000Z', w: '10/10/24' },
        G2: { t: 's', v: '9:09' },
        H2: { t: 'n', w: '90', v: 90 },
        I2: { t: 'n', w: '90', v: 90 },
        J2: { t: 's', v: 'release' },
        K2: { t: 's', v: 'capture' },
        A3: { z: 'm/d/yy', t: 'd', v: '2024-10-10T07:00:00.000Z', w: '10/10/24' },
        B3: { t: 's', v: 'Carlita' },
        D3: { t: 'n', w: '90', v: 90 },
        E3: { t: 'n', w: '100', v: 100 },
        '!ref': 'A1:K3'
      };

      const mockDBConnection = getMockDBConnection();

      const importCapturesService = new ImportCapturesService(mockDBConnection, 1);

      const getDefaultWorksheetStub = sinon.stub(worksheetUtils, 'getDefaultWorksheet');
      const aliasMapStub = sinon.stub(importCapturesService.surveyCritterService, 'getSurveyCritterAliasMap');
      const critterbaseInsertStub = sinon.stub(
        importCapturesService.surveyCritterService.critterbaseService,
        'bulkCreate'
      );

      getDefaultWorksheetStub.returns(worksheet);
      aliasMapStub.resolves(
        new Map([
          [
            'carl',
            {
              critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
              captures: [{ capture_id: '', capture_date: '', capture_time: '' }]
            } as ICritterDetailed
          ],
          [
            'carlita',
            {
              critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
              captures: [{ capture_id: '', capture_date: '', capture_time: '' }]
            } as ICritterDetailed
          ]
        ])
      );
      critterbaseInsertStub.resolves({ created: { captures: 2 } } as IBulkCreateResponse);

      const data = await importCSV(new MediaFile('test', 'test', 'test' as unknown as Buffer), importCapturesService);

      expect(data).to.deep.equal(2);
    });
  });
  describe('validateRows', () => {
    it('should format and validate the rows successfully', async () => {
      const mockConnection = getMockDBConnection();
      const importCaptures = new ImportCapturesService(mockConnection, 1);
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterAliasMap');

      aliasMapStub.resolves(
        new Map([
          [
            'carl',
            {
              critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
              captures: [{ capture_id: '', capture_date: '', capture_time: '' }]
            } as ICritterDetailed
          ]
        ])
      );

      const validate = await importCaptures.validateRows([
        {
          ALIAS: 'Carl',
          CAPTURE_DATE: '2024-01-01',
          CAPTURE_TIME: '10:10:10',
          CAPTURE_LATITUDE: 90,
          CAPTURE_LONGITUDE: 90,
          RELEASE_DATE: '2024-01-01',
          RELEASE_TIME: '11:11:11',
          RELEASE_LATITUDE: 80,
          RELEASE_LONGITUDE: 80,
          CAPTURE_COMMENT: 'capture',
          RELEASE_COMMENT: 'release'
        }
      ]);

      if (validate.success) {
        expect(validate.data[0]).to.contain({
          critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
          capture_date: '2024-01-01',
          capture_time: '10:10:10',
          capture_latitude: 90,
          capture_longitude: 90,
          release_date: '2024-01-01',
          release_time: '11:11:11',
          release_latitude: 80,
          release_longitude: 80,
          capture_comment: 'capture',
          release_comment: 'release'
        });
        expect(validate.data[0].capture_location_id).to.exist;
        expect(validate.data[0].release_location_id).to.exist;
      } else {
        expect.fail();
      }
    });

    it('should format and validate the rows with optional values successfully', async () => {
      const mockConnection = getMockDBConnection();
      const importCaptures = new ImportCapturesService(mockConnection, 1);
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterAliasMap');

      aliasMapStub.resolves(
        new Map([
          [
            'carl',
            {
              critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
              captures: [{ capture_id: '', capture_date: '', capture_time: '' }]
            } as ICritterDetailed
          ]
        ])
      );

      const validate = await importCaptures.validateRows([
        {
          ALIAS: 'Carl',
          CAPTURE_DATE: '2024-01-01',
          CAPTURE_LATITUDE: 90,
          CAPTURE_LONGITUDE: 90
        }
      ]);

      if (validate.success) {
        expect(validate.data[0]).to.contain({
          critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
          capture_date: '2024-01-01',
          capture_latitude: 90,
          capture_longitude: 90,
          capture_time: undefined,
          release_date: undefined,
          release_time: undefined,
          release_latitude: undefined,
          release_longitude: undefined,
          capture_comment: undefined,
          release_comment: undefined
        });
        expect(validate.data[0].capture_location_id).to.exist;
      } else {
        expect.fail();
      }
    });

    it('should return error if invalid', async () => {
      const mockConnection = getMockDBConnection();
      const importCaptures = new ImportCapturesService(mockConnection, 1);
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterAliasMap');

      aliasMapStub.resolves(
        new Map([
          [
            'carl',
            {
              critter_id: '3647cdc9-6fe9-4c32-acfa-6096fe123c4a',
              captures: [{ capture_id: '', capture_date: '', capture_time: '' }]
            } as ICritterDetailed
          ]
        ])
      );

      const validate = await importCaptures.validateRows([
        {
          ALIAS: 'Carl',
          CAPTURE_DATE: '2024-01-01',
          CAPTURE_LATITUDE: 90
        }
      ]);

      if (validate.success) {
        expect.fail();
      } else {
        expect(validate.error.issues.length).to.be.eql(1);
      }
    });
  });
});
