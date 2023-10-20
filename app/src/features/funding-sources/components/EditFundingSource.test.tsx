import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetFundingSourceResponse, IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { act, cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import EditFundingSource from './EditFundingSource';

jest.mock('../../../hooks/useBioHubApi');
const mockBioHubApi = useBiohubApi as jest.Mock;
const mockUseApi = {
  funding: {
    getFundingSources: jest.fn<Promise<IGetFundingSourcesResponse[]>, []>(),
    getFundingSource: jest.fn<Promise<IGetFundingSourceResponse>, []>(),
    putFundingSource: jest.fn<Promise<{ funding_source_id: number }>, []>()
  }
};
const history = createMemoryHistory();
describe('EditFundingSource', () => {
  beforeEach(() => {
    mockBioHubApi.mockImplementation(() => mockUseApi);
    mockUseApi.funding.getFundingSources.mockClear();
    mockUseApi.funding.getFundingSource.mockClear();
    mockUseApi.funding.putFundingSource.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with prefilled form fields', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    mockUseApi.funding.getFundingSources.mockResolvedValue([]);
    mockUseApi.funding.getFundingSource.mockResolvedValue({
      funding_source: {
        funding_source_id: 1,
        name: 'Funding Source Name',
        description: 'funding source description',
        start_date: null,
        end_date: null,
        revision_count: 1,
        survey_reference_count: 0,
        survey_reference_amount_total: 0
      },
      funding_source_survey_references: []
    });

    const onClose = jest.fn();

    const { getByDisplayValue } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <EditFundingSource fundingSourceId={1} onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );
    await waitFor(() => {
      expect(getByDisplayValue('Funding Source Name', { exact: false })).toBeVisible();
      expect(getByDisplayValue('funding source description', { exact: false })).toBeVisible();
    });
  });

  it('form submits properly', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    mockUseApi.funding.getFundingSources.mockResolvedValue([]);
    mockUseApi.funding.getFundingSource.mockResolvedValue({
      funding_source: {
        funding_source_id: 1,
        name: 'Funding Source Name',
        description: 'funding source description',
        start_date: null,
        end_date: null,
        revision_count: 1,
        survey_reference_count: 0,
        survey_reference_amount_total: 0
      },
      funding_source_survey_references: []
    });

    const onClose = jest.fn();

    const { findByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <EditFundingSource fundingSourceId={1} onClose={onClose} open={true} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await act(async () => {
      const button = await findByTestId('edit-dialog-save');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockUseApi.funding.putFundingSource).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
