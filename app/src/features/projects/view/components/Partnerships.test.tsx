import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';
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

describe('Partnerships', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Partnerships
          projectForViewData={{
            ...getProjectForViewResponse,
            partnerships: {
              indigenous_partnerships: [],
              stakeholder_partnerships: []
            }
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
        <Partnerships
          projectForViewData={{
            ...getProjectForViewResponse,
            partnerships: {
              indigenous_partnerships: (null as unknown) as string[],
              stakeholder_partnerships: (null as unknown) as string[]
            }
          }}
          codes={codes}
        />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing partnership values', () => {
    const { asFragment } = render(
      <Router history={history}>
        <Partnerships projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the partnerships works in the dialog', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: ['partner 1', 'partner 2']
      }
    });

    const { getByText } = render(
      <Router history={history}>
        <Partnerships projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
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
        <Partnerships projectForViewData={{ ...getProjectForViewResponse }} codes={codes} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Failed to Fetch Edit Data')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(getByText('Failed to Fetch Edit Data')).not.toBeVisible();
    });
  });
});
