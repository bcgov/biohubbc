import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import IUCNClassification from './IUCNClassification';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
import { useBiohubApi } from 'hooks/useBioHubApi';

const history = createMemoryHistory();

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('IUCNClassification', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <IUCNClassification projectForViewData={getProjectForViewResponse} codes={codes} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the IUCN classification works in the dialog', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
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

    const { getByText } = render(
      <Router history={history}>
        <IUCNClassification projectForViewData={getProjectForViewResponse} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('IUCN Classification')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit IUCN Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit IUCN Classification')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit IUCN Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      iucn: null
    });

    const { getByText } = render(
      <Router history={history}>
        <IUCNClassification projectForViewData={getProjectForViewResponse} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('IUCN Classification')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Error Editing IUCN Classification')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(getByText('Error Editing IUCN Classification')).not.toBeVisible();
    });
  });
});
