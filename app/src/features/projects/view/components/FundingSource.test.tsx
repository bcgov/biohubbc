import { fireEvent, render, waitFor, cleanup, within } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';
jest.mock('../../../../hooks/useBioHubApi');
const mockRefresh = jest.fn();

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    updateProject: jest.fn(),
    addFundingSource: jest.fn(),
    deleteFundingSource: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('FundingSource', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.updateProject.mockClear();
    mockBiohubApi().project.addFundingSource.mockClear();
    mockBiohubApi().project.deleteFundingSource.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('opens the edit funding source dialog box when edit button is clicked, and cancel button works as expected', async () => {
    const { getByText, queryByText } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Funding Source')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Funding Source')).not.toBeInTheDocument();
    });
  });

  it('edits a funding source correctly in the dialog', async () => {
    const { getByText } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Agency Details')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('deletes a funding source as expected', async () => {
    const { getByText, getByTestId } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('delete-funding-source'));

    await waitFor(() => {
      expect(getByText('Are you sure you want to delete?')).toBeVisible();
    });

    fireEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockBiohubApi().project.deleteFundingSource).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('adds a funding source as expected', async () => {
    const { getByText, getByTestId, getAllByRole, getByRole } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
          funding: { ...getProjectForViewResponse.funding, fundingSources: [] }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Add Funding Source'));

    await waitFor(() => {
      expect(getByText('Agency Details')).toBeInTheDocument();
    });

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const agencyNameListbox = within(getByRole('listbox'));

    fireEvent.click(agencyNameListbox.getByText(/Funding source code/i));

    await waitFor(() => {
      expect(getByTestId('investment_action_category')).toBeInTheDocument();
    });

    fireEvent.mouseDown(getAllByRole('button')[1]);

    const investmentActionCategoryListbox = within(getByRole('listbox'));

    fireEvent.click(investmentActionCategoryListbox.getByText(/Investment action category/i));
    fireEvent.change(getByTestId('funding_amount'), { target: { value: 100 } });
    fireEvent.change(getByTestId('start-date'), { target: { value: '2021-03-14' } });
    fireEvent.change(getByTestId('end-date'), { target: { value: '2021-05-14' } });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockBiohubApi().project.addFundingSource).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });
});
