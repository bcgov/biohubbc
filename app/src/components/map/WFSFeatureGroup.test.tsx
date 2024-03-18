import { useBiohubApi } from 'hooks/useBioHubApi';
import { cleanup } from 'test-helpers/test-utils';

jest.mock('../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  external: {
    get: jest.fn()
  }
};

describe('WFSFeatureGroup', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-124.044265, 48.482268],
            [-124.044265, 49.140633],
            [-122.748143, 49.140633],
            [-122.748143, 48.482268],
            [-124.044265, 48.482268]
          ]
        ]
      },
      properties: {
        OBJECTID: 332,
        REGION_RESPONSIBLE_NAME: 'region'
      }
    };

    mockUseApi.external.get.mockResolvedValue({
      features: [feature]
    });

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });
});
