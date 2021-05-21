import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { LayersControl, MapContainer } from 'react-leaflet';
import { MapBounds } from './MapContainer';
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

describe('MapContainer', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().external.get.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('matches the snapshot with an overlay pane', async () => {
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
        OBJECTID: 332
      }
    };

    mockBiohubApi().external.get.mockResolvedValue({
      features: [feature]
    });

    const initialBounds: any[] = [
      [48.25443233, -123.88613849],
      [49.34875907, -123.00382943]
    ];

    const onSelectGeometry = jest.fn();

    const { getByTestId, getByText, container } = render(
      <MapContainer id={'test-map'} style={{ height: '100%' }} center={[55, -128]} zoom={10} scrollWheelZoom={false}>
        <MapBounds bounds={initialBounds} />
        <LayersControl position="bottomright">
          <LayersControl.Overlay name="Wildlife Management Units">
            <WFSFeatureGroup
              name="Wildlife Management Units"
              typeName="pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW"
              onSelectGeometry={onSelectGeometry}
            />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    );

    fireEvent.click(getByText('Wildlife Management Units'));

    await waitFor(() => {
      expect(mockBiohubApi().external.get).toHaveBeenCalledWith(
        expect.stringContaining('pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW')
      );
    });

    // Get the child element from the overlay pane (which should be our single feature element)
    const overlayFeatureElement = container.querySelector('.leaflet-overlay-pane .leaflet-interactive');

    if (!overlayFeatureElement) {
      fail();
    }

    fireEvent.click(overlayFeatureElement);

    await waitFor(() => {
      expect(getByTestId('add_boundary')).toBeVisible();
    });

    fireEvent.click(getByTestId('add_boundary'));

    await waitFor(() => {
      expect(onSelectGeometry).toHaveBeenCalledWith(feature);
    });
  });
});
