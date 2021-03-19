import React from 'react';
import { render } from '@testing-library/react';
import LocationBoundary from './LocationBoundary';
import { Feature } from 'geojson';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

describe('LocationBoundary', () => {
  test('matches the snapshot when the geometry is a single polygon in valid GeoJSON format', () => {
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

    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...projectForViewData,
          location: { ...projectForViewData.location, geometry }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot when the geometry is a single polygon in invalid GeoJSON format', () => {
    const geometry: any[] = [
      {
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
      }
    ];

    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...projectForViewData,
          location: { ...projectForViewData.location, geometry }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot when the geometry is a multipolygon', () => {
    const geometry: any[] = [
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          [
            [
              [-129, 56],
              [-129, 56.5],
              [-129, 57],
              [-127, 59],
              [-129, 56]
            ]
          ]
        ]
      }
    ];

    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...projectForViewData,
          location: { ...projectForViewData.location, geometry }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot when the geometry is a geometry collection', () => {
    const geometry: any[] = [
      {
        type: 'GeometryCollection',
        geometries: [
          {
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
          }
        ]
      }
    ];

    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...projectForViewData,
          location: { ...projectForViewData.location, geometry }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
