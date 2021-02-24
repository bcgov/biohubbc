import React from 'react';
import { render } from '@testing-library/react';
import MapEditControls from './MapEditControls';
import { FeatureGroup, MapContainer } from 'react-leaflet';
import { Feature } from 'geojson';

describe('MapEditControls.test', () => {
  const alert = jest.fn();

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

  test('MapEditControls successfully mounts the controls', () => {
    render(
      <MapContainer>
        <FeatureGroup>
          <MapEditControls geometry={geometry} position="topright" onMounted={() => alert('mounted')} />
        </FeatureGroup>
      </MapContainer>
    );

    expect(alert).toHaveBeenCalledWith('mounted');
  });
});
