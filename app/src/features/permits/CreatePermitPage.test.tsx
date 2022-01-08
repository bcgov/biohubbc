import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import CreatePermitPage from './CreatePermitPage';
import { MemoryRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory();

jest.mock('../../hooks/useRestorationTrackerApi');

const mockuseRestorationTrackerApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  permit: {
    createPermits: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('CreatePermitPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().permit.createPermits.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when codes not yet loaded', async () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CreatePermitPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly when codes are loaded', async () => {
    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    const { asFragment, getAllByText } = render(
      <MemoryRouter>
        <CreatePermitPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Are you sure? Dialog', () => {
    it('calls history.push() if the user clicks `Yes`', async () => {
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }]
      } as any);

      history.push('/home');
      history.push('/admin/permits/create');

      const { getByText, getAllByText, getByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <CreatePermitPage />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getByTestId('yes-button'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/permits');
      });
    });

    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }]
      } as any);

      const { getAllByText, getByText, getAllByRole, getByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <CreatePermitPage />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Permits')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getByTestId('no-button'));

      await waitFor(() => {
        expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Permits')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      // Get the backdrop, then get the firstChild because this is where the event listener is attached
      //@ts-ignore
      fireEvent.click(getAllByRole('presentation')[0].firstChild);

      await waitFor(() => {
        expect(getAllByText('Create Non-Sampling Permits').length).toEqual(1);
      });
    });
  });
});
