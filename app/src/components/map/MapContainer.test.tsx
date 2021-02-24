import React from 'react';
import { render } from '@testing-library/react';
import MapContainer from './MapContainer';
import { Feature } from 'geojson';

describe('MapContainer.test', () => {
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

  test('MapContainer matches the snapshot with geometries being passed in', () => {
    const { asFragment } = render(
      <MapContainer mapId="myMap" classes={classes} geometryState={{ geometry, setGeometry }} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('MapContainer matches the snapshot with non editable geos being passed in', () => {
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
});
