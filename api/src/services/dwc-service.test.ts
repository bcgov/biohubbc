import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as spatial_utils from '../utils/spatial-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { DwCService } from './dwc-service';

chai.use(sinonChai);

describe('DwCService', () => {
  it('constructs', () => {
    const dbConnectionObj = getMockDBConnection();

    const dwcService = new DwCService(dbConnectionObj);

    expect(dwcService).to.be.instanceof(DwCService);
  });

  describe('decorateLatLong', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns if decimalLatitude and decimalLongitude are filled ', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);
      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '', decimalLatitude: 123, decimalLongitude: 123 }]
        }
      };

      const newJson = await dwcService.decorateLatLong(jsonObject);

      expect(newJson).to.eql(jsonObject);
    });

    it('succeeds and decorates Lat Long', async () => {
      const dbConnectionObj = getMockDBConnection();

      const dwcService = new DwCService(dbConnectionObj);
      const jsonObject = {
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '12 12314 12241' }]
        }
      };

      sinon.stub(spatial_utils, 'parseUTMString').returns({
        easting: 1,
        northing: 2,
        zone_letter: 'a',
        zone_number: 3,
        zone_srid: 4
      });

      sinon.stub(spatial_utils, 'utmToLatLng').returns({ latitude: 1, longitude: 2 });

      const response = await await dwcService.decorateLatLong(jsonObject);

      expect(response).to.eql({
        item_with_depth_1: {
          item_with_depth_2: [{ verbatimCoordinates: '12 12314 12241', decimalLatitude: 1, decimalLongitude: 2 }]
        }
      });
    });
  });
});
