import React from 'react';
import { render } from '@testing-library/react';
import LocationBoundary from './LocationBoundary';
import { Feature } from 'geojson';
import { IProjectWithDetails } from 'interfaces/project-interfaces';

const projectWithDetailsData: IProjectWithDetails = {
  id: 1,
  project: {
    project_name: 'Test Project Name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    climate_change_initiatives: [],
    project_activities: []
  },
  location: {
    location_description: 'Location description',
    regions: ['Region 1', 'Region 2'],
    geometry: []
  },
  objectives: {
    objectives: 'Et ad et in culpa si',
    caveats: 'sjwer bds'
  }
};

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
        projectWithDetailsData={{
          ...projectWithDetailsData,
          location: { ...projectWithDetailsData.location, geometry }
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
        projectWithDetailsData={{
          ...projectWithDetailsData,
          location: { ...projectWithDetailsData.location, geometry }
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
        projectWithDetailsData={{
          ...projectWithDetailsData,
          location: { ...projectWithDetailsData.location, geometry }
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
        projectWithDetailsData={{
          ...projectWithDetailsData,
          location: { ...projectWithDetailsData.location, geometry }
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
