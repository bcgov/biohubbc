import { expect } from 'chai';
import sinon from 'sinon';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ImportCapturesService } from './import-captures-service';

describe('import-captures-service', () => {
  describe('validateRows', () => {
    it('should format and validate the rows successfully', async () => {
      const mockConnection = getMockDBConnection();
      const importCaptures = new ImportCapturesService(mockConnection, 1);
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterIdAliasMap');

      aliasMapStub.resolves(new Map([['Carl', '3647cdc9-6fe9-4c32-acfa-6096fe123c4a']]));

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
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterIdAliasMap');

      aliasMapStub.resolves(new Map([['Carl', '3647cdc9-6fe9-4c32-acfa-6096fe123c4a']]));

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
      const aliasMapStub = sinon.stub(importCaptures.surveyCritterService, 'getSurveyCritterIdAliasMap');

      aliasMapStub.resolves(new Map([['Carl', '3647cdc9-6fe9-4c32-acfa-6096fe123c4a']]));

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