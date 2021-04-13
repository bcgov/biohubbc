import React from 'react';
import { render, getByText, queryByText } from '@testing-library/react';
import MapEditControls from './MapEditControls';
import { FeatureGroup, MapContainer } from 'react-leaflet';
import { Feature } from 'geojson';

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
