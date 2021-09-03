import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import CreatePermitPage from './CreatePermitPage';
import { MemoryRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');

const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  permit: {
    createPermits: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('CreatePermitPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().permit.createPermits.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
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
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
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
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
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
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
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
