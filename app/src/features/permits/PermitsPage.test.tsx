import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import PermitsPage from './PermitsPage';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

jest.mock('../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  permit: {
    getPermitsList: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PermitsPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().permit.getPermitsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with the create non sampling permits button', async () => {
    mockRestorationTrackerApi().permit.getPermitsList.mockResolvedValue([]);

    const { baseElement } = render(
      <MemoryRouter>
        <PermitsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(baseElement).toHaveTextContent('Create Non-Sampling Permits');
    });
  });

  test('renders with a proper list of permits', async () => {
    mockRestorationTrackerApi().permit.getPermitsList.mockResolvedValue([
      {
        id: 1,
        number: '123',
        type: 'Wildlife',
        coordinator_agency: 'contact agency',
        project_name: 'Project 1'
      },
      {
        id: 2,
        number: '1234',
        type: 'Wildlife',
        coordinator_agency: 'contact agency 2',
        project_name: null
      }
    ]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <PermitsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('permit-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('navigating to the create non sampling permit page works', async () => {
    mockRestorationTrackerApi().permit.getPermitsList.mockResolvedValue([
      {
        id: 1,
        number: '123',
        type: 'Wildlife',
        coordinator_agency: 'contact agency',
        project_name: 'Project 1'
      }
    ]);

    const { getByText, getByTestId } = render(
      <Router history={history}>
        <PermitsPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('permit-table')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Create Non-Sampling Permits'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/permits/create');
      expect(history.location.search).toEqual('');
    });
  });
});
