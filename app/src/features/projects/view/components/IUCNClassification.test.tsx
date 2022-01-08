import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import IUCNClassification from './IUCNClassification';
import { codes } from 'test-helpers/code-helpers';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { DialogContextProvider } from 'contexts/dialogContext';

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <IUCNClassification projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('IUCNClassification', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no classification details', () => {
    const { asFragment } = render(
      <IUCNClassification
        projectForViewData={{
          ...getProjectForViewResponse,
          iucn: {
            classificationDetails: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with classification details', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the IUCN classification works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 1,
            subClassification2: 1
          }
        ]
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.iucn
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit IUCN Classifications')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit IUCN Classifications')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit IUCN Classifications')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        iucn: {
          classificationDetails: [
            {
              classification: 1,
              subClassification1: 1,
              subClassification2: 1
            }
          ]
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      iucn: null
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing IUCN Classifications')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing IUCN Classifications')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting IUCN data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();
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

  it('shows error dialog with API error message when updating IUCN data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 1,
            subClassification2: 1
          }
        ]
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('IUCN Conservation Actions Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.iucn
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit IUCN Classifications')).toBeVisible();
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
