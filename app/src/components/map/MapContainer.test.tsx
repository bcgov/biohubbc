import bbox from '@turf/bbox';
import { Feature } from 'geojson';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { LatLngBoundsExpression } from 'leaflet';
import React from 'react';
import { Router } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import MapContainer, { INonEditableGeometries } from './MapContainer';
import { SearchFeaturePopup } from './SearchFeaturePopup';

jest.mock('../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  external: {
    get: jest.fn(),
    post: jest.fn()
  }
};

const history = createMemoryHistory();

describe('MapContainer', () => {
  // To ignore: Deprecated use of _flat, please use L.LineUtil.isFlat instead
  console.warn = jest.fn();

  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.external.get.mockResolvedValue({
      features: []
    });
    mockUseApi.external.post.mockResolvedValue({
      features: []
    });

    jest.spyOn(console, 'debug').mockImplementation(() => {});
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

  const initialFeatures: Feature[] = [
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
  const onDrawChange = jest.fn();

  test('matches the snapshot with geometries being passed in', () => {
    const { asFragment } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
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
        drawControls={{ initialFeatures }}
        onDrawChange={onDrawChange}
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
          drawControls={{ initialFeatures }}
          onDrawChange={onDrawChange}
          nonEditableGeometries={nonEditableGeometries}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot with draw controls hidden', () => {
    const { asFragment } = render(<MapContainer mapId="myMap" classes={classes} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test('draws a marker successfully on the map and updates the geometry', () => {
    const { getByText, getByRole } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    fireEvent.click(getByText('Draw a marker'));

    // Click on existing geometry on map to place a marker in that location
    fireEvent.click(getByRole('presentation'));

    expect(onDrawChange).toHaveBeenCalled();
  });

  test('sets the bounds of the geo being passed in successfully', () => {
    const bboxCoords = bbox(initialFeatures[0]);
    const bounds: LatLngBoundsExpression = [
      [bboxCoords[1], bboxCoords[0]],
      [bboxCoords[3], bboxCoords[2]]
    ];

    const { asFragment } = render(
      <MapContainer
        mapId="myMap"
        classes={classes}
        drawControls={{ initialFeatures }}
        onDrawChange={onDrawChange}
        bounds={bounds}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('edits geometries as expected', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    fireEvent.click(getByText('Edit layers'));

    await waitFor(() => {});

    fireEvent.click(getByText('Save'));

    expect(onDrawChange).toHaveBeenCalledWith(initialFeatures);
  });

  test('deletes geometries currently present on the map successfully when user confirms', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    await waitFor(() => {
      fireEvent.click(getByText('Yes'));
    });

    expect(onDrawChange).toHaveBeenCalledWith([]);
  });

  test('does not delete geometries present on the map when user does not confirm by clicking no', async () => {
    const { getByText } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    await waitFor(() => {
      fireEvent.click(getByText('No'));
    });

    expect(onDrawChange).toHaveBeenCalledWith(initialFeatures);
  });

  test('does not delete geometries present on the map when user does not confirm by clicking out of the dialog', async () => {
    const { getByText, getAllByRole } = render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    fireEvent.click(getByText('Delete layers'));

    await waitFor(() => {
      fireEvent.click(getByText('Clear All'));
    });

    render(
      <MapContainer mapId="myMap" classes={classes} drawControls={{ initialFeatures }} onDrawChange={onDrawChange} />
    );

    await waitFor(() => {
      // Get the backdrop, then get the firstChild because this is where the event listener is attached
      //@ts-ignore
      fireEvent.click(getAllByRole('presentation')[0].firstChild);
    });

    expect(onDrawChange).toHaveBeenCalledWith(initialFeatures);
  });
});
