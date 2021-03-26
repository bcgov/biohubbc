import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Species from './Species';
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

describe('Species', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species
          projectForViewData={{
            ...getProjectForViewResponse,
            species: { focal_species: [], ancillary_species: [] }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species
          projectForViewData={{
            ...getProjectForViewResponse,
            species: { focal_species: (null as unknown) as string[], ancillary_species: (null as unknown) as string[] }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Species projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the species works in the dialog', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      species: {
        focal_species: ['species 1', 'species 2'],
        ancillary_species: ['species 1', 'species 2']
      }
    });

    const { getByText } = render(
      <Router history={history}>
        <Species projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );
    await waitFor(() => {
      expect(getByText('Species')).toBeVisible();
    });
    fireEvent.click(getByText('EDIT'));
    await waitFor(() => {
      expect(getByText('Edit Species')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit Species')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Species')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      partnerships: null
    });

    const { getByText } = render(
      <Router history={history}>
        <Species projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Species')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Error Editing Species')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(getByText('Error Editing Species')).not.toBeVisible();
    });
  });
});
