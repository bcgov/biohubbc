import { cleanup, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetFundingSourceResponse } from 'interfaces/useFundingSourceApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { render } from 'test-helpers/test-utils';
import DeleteFundingSource from './DeleteFundingSource';

jest.mock('../../../hooks/useBioHubApi');
const mockBioHubApi = useBiohubApi as jest.Mock;
const mockUseApi = {
  funding: {
    getFundingSource: jest.fn<Promise<IGetFundingSourceResponse>, []>()
  }
};
const history = createMemoryHistory();

describe('DeleteFundingSource', () => {
  beforeEach(() => {
    mockBioHubApi.mockImplementation(() => mockUseApi);
    mockUseApi.funding.getFundingSource.mockClear();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders delete option', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });
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
    const openViewModal = jest.fn();

    const { findByText } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <DeleteFundingSource fundingSourceId={1} open={true} onClose={onClose} openViewModal={openViewModal} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(async () => {
      expect(mockUseApi.funding.getFundingSource).toBeCalled();
      expect(await findByText('Delete Funding Source?')).toBeVisible();
    });
  });

  it('renders view more dialog', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });
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
      funding_source_survey_references: [
        {
          survey_funding_source_id: 1,
          survey_id: 1,
          funding_source_id: 1,
          amount: 1,
          revision_count: 1,
          project_id: 1,
          survey_name: 'Survey'
        }
      ]
    });

    const onClose = jest.fn();
    const openViewModal = jest.fn();

    const { findByText } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <DialogContextProvider>
            <DeleteFundingSource fundingSourceId={1} open={true} onClose={onClose} openViewModal={openViewModal} />
          </DialogContextProvider>
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(async () => {
      expect(mockUseApi.funding.getFundingSource).toBeCalled();
      expect(await findByText("You can't delete this funding source")).toBeVisible();
    });
  });
});
