import { getByText, queryByText, render } from '@testing-library/react';
import { Feature } from 'geojson';
import React from 'react';
import { FeatureGroup, MapContainer } from 'react-leaflet';
import MapEditControls from './MapEditControls';

describe('MapEditControls.test', () => {
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
    const { container } = render(
      <MapContainer>
        <FeatureGroup>
          <MapEditControls geometry={geometry} position="topright" />
        </FeatureGroup>
      </MapContainer>
    );

    //@ts-ignore
    expect(getByText(container, 'Draw a rectangle')).toBeInTheDocument();
  });

  test('MapEditControls removes draw controls when specified', () => {
    const { container } = render(
      <MapContainer>
        <FeatureGroup>
          <MapEditControls
            geometry={geometry}
            position="topright"
            draw={{
              rectangle: false
            }}
          />
        </FeatureGroup>
      </MapContainer>
    );

    //@ts-ignore
    expect(queryByText(container, 'Draw a rectangle')).toBeNull();
  });
});
