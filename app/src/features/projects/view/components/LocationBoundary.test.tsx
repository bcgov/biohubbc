import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import LocationBoundary from './LocationBoundary';
import { Feature } from 'geojson';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

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
      <Router history={history}>
        <LocationBoundary
          projectForViewData={{
            ...getProjectForViewResponse,
            location: { ...getProjectForViewResponse.location, geometry }
          }}
          codes={codes}
        />
      </Router>
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
      <Router history={history}>
        <LocationBoundary
          projectForViewData={{
            ...getProjectForViewResponse,
            location: { ...getProjectForViewResponse.location, geometry }
          }}
          codes={codes}
        />
      </Router>
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
      <Router history={history}>
        <LocationBoundary
          projectForViewData={{
            ...getProjectForViewResponse,
            location: { ...getProjectForViewResponse.location, geometry }
          }}
          codes={codes}
        />
      </Router>
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
      <Router history={history}>
        <LocationBoundary
          projectForViewData={{
            ...getProjectForViewResponse,
            location: { ...getProjectForViewResponse.location, geometry }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('editing the location boundary works in the dialog', async () => {
    const { getByText, queryByText } = render(
      <Router history={history}>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Location / Project Boundary')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });
});
