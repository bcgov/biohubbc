import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useSpatialApi from './useSpatialApi';

describe('useSpatialApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getRegions', () => {
    it('works as expected', async () => {
      const res = {
        regions: [
          {
            regionName: 'region',
            sourceLayer: 'layer'
          }
        ]
      };

      mock.onPost('/api/spatial/regions').reply(200, res);

      const result = await useSpatialApi(axios).getRegions([]);

      expect(result.regions[0].regionName).toEqual('region');
      expect(result.regions[0].sourceLayer).toEqual('layer');
    });
  });
});
