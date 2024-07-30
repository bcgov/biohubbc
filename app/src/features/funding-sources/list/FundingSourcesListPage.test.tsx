import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import CreateFundingSource from '../components/CreateFundingSource';
import DeleteFundingSource from '../components/DeleteFundingSource';
import EditFundingSource from '../components/EditFundingSource';
import FundingSourcePage from '../details/FundingSourcePage';
import FundingSourcesListPage from './FundingSourcesListPage';

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

vi.mock('../components/CreateFundingSource');
const mockCreateFundingSource = CreateFundingSource as Mock;

vi.mock('../components/EditFundingSource');
const mockEditFundingSource = EditFundingSource as Mock;

vi.mock('../components/DeleteFundingSource');
const mockDeleteFundingSource = DeleteFundingSource as Mock;

vi.mock('../details/FundingSourcePage');
const mockFundingSourcePage = FundingSourcePage as Mock;

describe('FundingSourcesListPage', () => {
  beforeEach(() => {
    mockCreateFundingSource.mockImplementation(() => <div data-testid="mock-create-funding-source" />);
    mockEditFundingSource.mockImplementation(() => <div data-testid="mock-edit-funding-source" />);
    mockDeleteFundingSource.mockImplementation(() => <div data-testid="mock-delete-funding-source" />);
    mockFundingSourcePage.mockImplementation(() => <div data-testid="mock-view-funding-source" />);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with no funding sources', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId } = render(<FundingSourcesListPage />);

    await waitFor(() => {
      expect(getByTestId('funding-source-list-create-button')).toBeVisible();
      expect(getByTestId('funding-source-list-found').textContent).toMatch(/Records Found.*\(0\)/);
    });
  });

  it('renders with funding sources', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [
      {
        funding_source_id: 1,
        name: 'funding source name 1',
        description: 'description',
        start_date: null,
        end_date: null,
        revision_count: 0,
        survey_reference_amount_total: 10500,
        survey_reference_count: 2
      },
      {
        funding_source_id: 2,
        name: 'funding source name 2',
        description: 'description 2',
        start_date: null,
        end_date: null,
        revision_count: 0,
        survey_reference_amount_total: 0,
        survey_reference_count: 0
      }
    ];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId, findByTestId } = render(<FundingSourcesListPage />);

    await waitFor(async () => {
      const createButton = await findByTestId('funding-source-list-create-button');
      expect(createButton).toBeVisible();
    });

    expect(getByTestId('funding-source-list-found').textContent).toMatch(/Records Found.*\(2\)/);
  });

  // Skipped pending some viable resolution to https://github.com/mui/mui-x/issues/1151
  it.skip('renders the create funding source component on create button click', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId } = render(<FundingSourcesListPage />);

    await waitFor(() => {
      expect(getByTestId('funding-source-list-create-button')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-list-create-button'));

    await waitFor(() => {
      expect(mockCreateFundingSource).toHaveBeenCalledWith(
        {
          open: true,
          onClose: expect.anything()
        },
        expect.anything()
      );
    });
  });

  // Skipped pending some viable resolution to https://github.com/mui/mui-x/issues/1151
  it.skip('renders the create funding source component on edit button click', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [
      {
        funding_source_id: 1,
        name: 'funding source name 1',
        description: 'description',
        start_date: null,
        end_date: null,
        revision_count: 0,
        survey_reference_amount_total: 10500,
        survey_reference_count: 2
      }
    ];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId } = render(<FundingSourcesListPage />);

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-action')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-action'));

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-edit')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-edit'));

    await waitFor(() => {
      expect(mockEditFundingSource).toHaveBeenCalledWith(
        {
          fundingSourceId: 1,
          open: true,
          onClose: expect.anything(),
          openViewModal: expect.anything()
        },
        expect.anything()
      );
    });
  });

  // Skipped pending some viable resolution to https://github.com/mui/mui-x/issues/1151
  it.skip('renders the create funding source component on delete button click', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [
      {
        funding_source_id: 1,
        name: 'funding source name 1',
        description: 'description',
        start_date: null,
        end_date: null,
        revision_count: 0,
        survey_reference_amount_total: 10500,
        survey_reference_count: 2
      }
    ];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId } = render(<FundingSourcesListPage />);

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-action')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-action'));

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-delete')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-delete'));

    await waitFor(() => {
      expect(mockDeleteFundingSource).toHaveBeenCalledWith(
        {
          fundingSourceId: 1,
          open: true,
          onClose: expect.anything()
        },
        expect.anything()
      );
    });
  });

  // Skipped pending some viable resolution to https://github.com/mui/mui-x/issues/1151
  it.skip('renders the create funding source component on view details button click', async () => {
    // Setup mock api response
    const getAllFundingSourcesStub = vi.fn();
    const mockUseApi = { funding: { getAllFundingSources: getAllFundingSourcesStub } };
    mockBiohubApi.mockImplementation(() => mockUseApi);

    const mockResponse: IGetFundingSourcesResponse[] = [
      {
        funding_source_id: 1,
        name: 'funding source name 1',
        description: 'description',
        start_date: null,
        end_date: null,
        revision_count: 0,
        survey_reference_amount_total: 10500,
        survey_reference_count: 2
      }
    ];
    getAllFundingSourcesStub.mockResolvedValue(mockResponse);

    // Render component
    const { getByTestId } = render(<FundingSourcesListPage />);

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-action')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-action'));

    await waitFor(() => {
      expect(getByTestId('funding-source-table-row-view')).toBeVisible();
    });

    fireEvent.click(getByTestId('funding-source-table-row-view'));

    await waitFor(() => {
      expect(mockFundingSourcePage).toHaveBeenCalledWith(
        {
          fundingSourceId: 1,
          open: true,
          onClose: expect.anything()
        },
        expect.anything()
      );
    });
  });
});
