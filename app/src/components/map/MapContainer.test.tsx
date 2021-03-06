import React from 'react';
import { render, fireEvent, getByText, getByRole, waitFor } from '@testing-library/react';
import MapContainer from './MapContainer';
import { Feature } from 'geojson';
import bbox from '@turf/bbox';

describe('MapContainer', () => {
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
    const nonEditableGeometries: Feature[] = [
      {
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

  test('draws a marker successfully on the map and updates the geometry', () => {
    const { container } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    //@ts-ignore
    fireEvent.click(getByText(container, 'Draw a marker'));

    //@ts-ignore
    // Click on existing geometry on map to place a marker in that location
    fireEvent.click(getByRole(container, 'presentation'));

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

  test('editing geometries works as expected', async () => {
    const { container } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    //@ts-ignore
    fireEvent.click(getByText(container, 'Edit layers'));

    await waitFor(() => {});

    //@ts-ignore
    fireEvent.click(getByText(container, 'Save'));

    expect(setGeometry).toHaveBeenCalledWith(geometry);
  });

  test('deletes geometries currently present on the map successfully', async () => {
    const { container } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    //@ts-ignore
    fireEvent.click(getByText(container, 'Delete layers'));

    await waitFor(() => {});

    //@ts-ignore
    fireEvent.click(getByText(container, 'Clear All'));

    expect(setGeometry).toHaveBeenCalledWith([]);
  });
});
