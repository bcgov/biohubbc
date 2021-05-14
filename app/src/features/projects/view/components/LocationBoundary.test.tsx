import React from 'react';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import LocationBoundary from './LocationBoundary';
import { Feature } from 'geojson';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { codes } from 'test-helpers/code-helpers';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { DialogContextProvider } from 'contexts/dialogContext';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

describe('LocationBoundary', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const sharedGeometry: Feature[] = [
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

  test('matches the snapshot when there is no location description', () => {
    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, location_description: (null as unknown) as string }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot when there is no geometry', () => {
    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry: [] }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('matches the snapshot when the geometry is a single polygon in valid GeoJSON format', () => {
    const { asFragment } = render(
      <LocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry: sharedGeometry }
        }}
        codes={codes}
        refresh={mockRefresh}
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
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry }
        }}
        codes={codes}
        refresh={mockRefresh}
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
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry }
        }}
        codes={codes}
        refresh={mockRefresh}
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
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('editing the location boundary works in the dialog', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      location: {
        regions: ['region 1', 'region 2'],
        location_description: 'description',
        geometry: sharedGeometry,
        revision_count: 1
      }
    });

    const { getByText, queryByText } = render(
      <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.location
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Location / Project Boundary')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        location: {
          regions: ['region 1', 'region 2'],
          location_description: 'description',
          geometry: sharedGeometry,
          revision_count: 1
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      location: null
    });

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Location / Project Boundary')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting location data for update fails', async () => {
    mockBiohubApi().project.getProjectForUpdate = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it('shows error dialog with API error message when updating location data fails', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      location: {
        regions: ['region 1', 'region 2'],
        location_description: 'description',
        geometry: sharedGeometry,
        revision_count: 1
      }
    });
    mockBiohubApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.location
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Location / Project Boundary')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });
});
