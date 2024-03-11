import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import FundingSourcesTable from './FundingSourcesTable';

describe('FundingSourcesTable', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with an empty array of funding sources', async () => {
    const fundingSources: IGetFundingSourcesResponse[] = [];
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const { getByText } = render(
      <FundingSourcesTable fundingSources={fundingSources} onView={onView} onEdit={onEdit} onDelete={onDelete} />
    );

    await waitFor(() => {
      expect(getByText('No funding sources found')).toBeVisible();
    });
  });

  it('renders with non empty array of funding sources', async () => {
    const fundingSources: IGetFundingSourcesResponse[] = [];
    const onView = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const { getByTestId } = render(
      <FundingSourcesTable fundingSources={fundingSources} onView={onView} onEdit={onEdit} onDelete={onDelete} />
    );

    await waitFor(() => {
      expect(getByTestId('funding-source-table')).toBeVisible();
    });
  });
});
