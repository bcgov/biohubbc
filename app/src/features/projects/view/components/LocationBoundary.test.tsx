import React from 'react';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import LocationBoundary from './LocationBoundary';
import { Feature } from 'geojson';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { codes } from 'test-helpers/code-helpers';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { DialogContextProvider } from 'contexts/dialogContext';

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  },
  external: {
    get: jest.fn(),
    post: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockRefresh = jest.fn();

describe('LocationBoundary', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
    mockRestorationTrackerApi().external.get.mockClear();
    mockRestorationTrackerApi().external.post.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
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

  mockRestorationTrackerApi().external.get.mockResolvedValue({
    features: []
  });
  mockRestorationTrackerApi().external.post.mockResolvedValue({
    features: []
  });

  test('matches the snapshot when there is no location description', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('matches the snapshot when there is no geometry', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('matches the snapshot when the geometry is a single polygon in valid GeoJSON format', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('editing the location boundary works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      location: {
        location_description: 'description',
        geometry: sharedGeometry,
        revision_count: 1
      }
    });

    const { getByText, queryByText } = render(
      <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.location
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Project Location')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        location: {
          location_description: 'description',
          geometry: sharedGeometry,
          revision_count: 1
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      location: null
    });

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Project Location')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting location data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
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
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      location: {
        location_description: 'description',
        geometry: sharedGeometry,
        revision_count: 1
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = render(
      <DialogContextProvider>
        <LocationBoundary projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.location
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
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
