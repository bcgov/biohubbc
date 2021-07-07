import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import MapContainer, { INonEditableGeometries } from './MapContainer';
import { Feature } from 'geojson';
import bbox from '@turf/bbox';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { SearchFeaturePopup } from './SearchFeaturePopup';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  external: {
    get: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const history = createMemoryHistory();

describe('MapContainer', () => {
  // To ignore: Deprecated use of _flat, please use L.LineUtil.isFlat instead
  console.warn = jest.fn();

  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().external.get.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const classes = jest.fn().mockImplementation(() => {
    return jest.fn().mockReturnValue({
      map: {
        height: '100%',
        width: '100%'
      }
    });
  });

  const geometry: Feature[] = [
    {
      type: 'Feature',
      id: 'myGeo',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-128, 55],
            [-128, 55.5],
            [-128, 56],
            [-126, 58],
            [-128, 55]
          ]
        ]
      },
      properties: {
        name: 'Biohub Islands'
      }
    }
  ];
  const setGeometry = jest.fn();

  test('matches the snapshot with geometries being passed in', () => {
    const { asFragment } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot with non editable geos being passed in', () => {
    const nonEditableGeometries: INonEditableGeometries[] = [
      {
        feature: {
          type: 'Feature',
          id: 'nonEditableGeo',
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1]
          },
          properties: {
            name: 'Biodiversity Land'
          }
        }
      }
    ];

    const { asFragment } = render(
      <MapContainer
        mapId="myMap"
        classes={classes}
        geometryState={{ geometry, setGeometry }}
        nonEditableGeometries={nonEditableGeometries}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot with feature popup', () => {
    const nonEditableGeometries: INonEditableGeometries[] = [
      {
        feature: {
          id: 1,
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1]
          },
          type: 'Feature'
        },
        popupComponent: (
          <SearchFeaturePopup
            featureData={{
              id: 1,
              name: 'Name',
              objectives: 'Objectives'
            }}
          />
        )
      }
    ];

    const { asFragment } = render(
      <Router history={history}>
        <MapContainer
          mapId="myMap"
          classes={classes}
          geometryState={{ geometry, setGeometry }}
          nonEditableGeometries={nonEditableGeometries}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot with draw controls hidden', () => {
    const { asFragment } = render(<MapContainer mapId="myMap" classes={classes} hideDrawControls={true} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test('updates the geometry when a pre-defined feature is returned by an overlay layer', async () => {
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

    const setGeometry = jest.fn();

    const { getByText, getByTestId, container } = render(
      <MapContainer mapId="myMap" zoom={10} classes={classes} geometryState={{ geometry: [], setGeometry }} />
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

    expect(setGeometry).toHaveBeenCalledWith([feature]);
  });

  test('draws a marker successfully on the map and updates the geometry', () => {
    const { getByText, getByRole } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    fireEvent.click(getByText('Draw a marker'));

    // Click on existing geometry on map to place a marker in that location
    fireEvent.click(getByRole('presentation'));

    expect(setGeometry).toHaveBeenCalled();
  });

  test('sets the bounds of the geo being passed in successfully', () => {
    const bboxCoords = bbox(geometry[0]);
    const bounds = [
      [bboxCoords[1], bboxCoords[0]],
      [bboxCoords[3], bboxCoords[2]]
    ];

    const { asFragment } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} bounds={bounds} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('edits geometries as expected', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    fireEvent.click(getByText('Edit layers'));

    await waitFor(() => {});

    fireEvent.click(getByText('Save'));

    expect(setGeometry).toHaveBeenCalledWith(geometry);
  });

  test('deletes geometries currently present on the map successfully when user confirms', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(<MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />);

    await waitFor(() => {
      fireEvent.click(getByText('Yes'));
    });

    expect(setGeometry).toHaveBeenCalledWith([]);
  });

  test('does not delete geometries present on the map when user does not confirm by clicking no', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(<MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />);

    await waitFor(() => {
      fireEvent.click(getByText('No'));
    });

    expect(setGeometry).toHaveBeenCalledWith(geometry);
  });

  test('does not delete geometries present on the map when user does not confirm by clicking out of the dialog', async () => {
    const { getByText, getAllByRole } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(<MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />);

    await waitFor(() => {
      // Get the backdrop, then get the firstChild because this is where the event listener is attached
      //@ts-ignore
      fireEvent.click(getAllByRole('presentation')[0].firstChild);
    });

    expect(setGeometry).toHaveBeenCalledWith(geometry);
  });
});
