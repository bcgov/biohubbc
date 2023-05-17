import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { MapContainer } from 'react-leaflet';
import { SetMapBounds } from './components/Bounds';
import WFSFeatureGroup from './WFSFeatureGroup';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  external: {
    get: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('WFSFeatureGroup', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().external.get.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

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

  mockBiohubApi().external.get.mockResolvedValue({
    features: [feature]
  });

  test('matches the snapshot with wildlife management units layer showing', async () => {
    const initialBounds: any[] = [
      [48.25443233, -123.88613849],
      [49.34875907, -123.00382943]
    ];

    const onSelectGeometry = jest.fn();

    const { asFragment } = render(
      <MapContainer id={'test-map'} style={{ height: '100%' }} center={[55, -128]} zoom={10} scrollWheelZoom={false}>
        <SetMapBounds bounds={initialBounds} />
        <WFSFeatureGroup
          typeName="pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW"
          featureKeyHandler={() => 'uniqueFeatureKey'}
          popupContentHandler={() => {
            return { tooltip: 'Feature Name', content: <div>myFeature</div> };
          }}
          onSelectGeometry={onSelectGeometry}
          existingGeometry={[]}
        />
      </MapContainer>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
