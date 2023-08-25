import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetFundingSourceResponse, IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { act, cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import CreateFundingSource from './CreateFundingSource';

jest.mock('../../../hooks/useBioHubApi');
const mockBioHubApi = useBiohubApi as jest.Mock;
const mockUseApi = {
  funding: {
    getFundingSources: jest.fn<Promise<IGetFundingSourcesResponse[]>, []>(),
    postFundingSource: jest.fn<Promise<IGetFundingSourceResponse[]>, []>()
  }
};
const history = createMemoryHistory();
describe('CreateFundingSource', () => {
  beforeEach(() => {
    mockBioHubApi.mockImplementation(() => mockUseApi);
    mockUseApi.funding.getFundingSources.mockClear();
    mockUseApi.funding.postFundingSource.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with empty form fields', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    mockUseApi.funding.getFundingSources.mockResolvedValue([]);

    const onClose = jest.fn();

    const { getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <CreateFundingSource onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('name')).toBeVisible();
      expect(getByTestId('description')).toBeVisible();
      expect(getByTestId('start_date')).toBeVisible();
      expect(getByTestId('end_date')).toBeVisible();
    });
  });

  it('renders form errors when submitting with no data', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });
    mockUseApi.funding.getFundingSources.mockResolvedValue([]);
    const onClose = jest.fn();

    const { findByTestId, getByText } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <CreateFundingSource onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await act(async () => {
      // submit empty form
      const saveChangesButton = await findByTestId('edit-dialog-save');
      fireEvent.click(saveChangesButton);
    });

    await waitFor(() => {
      expect(getByText('Name is Required', { exact: false })).toBeVisible();
      expect(getByText('Description is Required', { exact: false })).toBeVisible();
    });
  });

  it('renders name used error when submitting with a previously used name', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });
    mockUseApi.funding.getFundingSources.mockResolvedValue([
      {
        funding_source_id: 1,
        name: 'Used Name',
        description: '',
        start_date: '',
        end_date: '',
        revision_count: 1,
        survey_reference_count: 0,
        survey_reference_amount_total: 0
      }
    ]);
    const onClose = jest.fn();

    const { findByTestId, getByText, getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <CreateFundingSource onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await act(async () => {
      // Fill form
      const nameInput = getByTestId('name');
      fireEvent.change(nameInput, { target: { value: 'Used Name' } });

      const descriptionInput = getByTestId('description');
      fireEvent.change(descriptionInput, { target: { value: 'description' } });

      // submit form
      const saveChangesButton = await findByTestId('edit-dialog-save');
      fireEvent.click(saveChangesButton);
    });

    await waitFor(() => {
      expect(getByText('Name has already been used', { exact: false })).toBeVisible();
    });
  });

  it('form submits properly', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });
    mockUseApi.funding.getFundingSources.mockResolvedValue([]);
    const onClose = jest.fn();

    const { findByTestId, getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <CreateFundingSource onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await act(async () => {
      // Fill form
      const nameInput = getByTestId('name');
      fireEvent.change(nameInput, { target: { value: 'Used Name' } });

      const descriptionInput = getByTestId('description');
      fireEvent.change(descriptionInput, { target: { value: 'description' } });

      // submit form
      const saveChangesButton = await findByTestId('edit-dialog-save');
      fireEvent.click(saveChangesButton);
    });

    await waitFor(() => {
      expect(mockUseApi.funding.postFundingSource).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
