import { fireEvent, render, waitFor, cleanup, within } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';
jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockRefresh = jest.fn();

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    updateProject: jest.fn(),
    addFundingSource: jest.fn(),
    deleteFundingSource: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('FundingSource', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.updateProject.mockClear();
    mockRestorationTrackerApi().project.addFundingSource.mockClear();
    mockRestorationTrackerApi().project.deleteFundingSource.mockClear();
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
    const { getByText, getByTestId, queryByText } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('edit-funding-source'));

    await waitFor(() => {
      expect(getByText('Edit Funding Source')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Funding Source')).not.toBeInTheDocument();
    });
  });

  it('edits a funding source correctly in the dialog', async () => {
    const { getByText, getByTestId } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('edit-funding-source'));

    await waitFor(() => {
      expect(getByText('Agency Details')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('shows error dialog with API error message when editing a funding source fails', async () => {
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getByTestId, queryByText, getAllByRole } = render(
      <DialogContextProvider>
        <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('edit-funding-source'));

    await waitFor(() => {
      expect(getByText('Agency Details')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it('deletes a funding source as expected', async () => {
    const { getByText, getByTestId } = render(
      <DialogContextProvider>
        <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('delete-funding-source'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeVisible();
    });

    fireEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.deleteFundingSource).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('closes the delete dialog when user decides not to delete their funding source', async () => {
    const { getByText, queryByText, getByTestId, getAllByRole } = render(
      <DialogContextProvider>
        <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('delete-funding-source'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeVisible();
    });

    fireEvent.click(getByText('No'));

    await waitFor(() => {
      expect(
        queryByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeNull();
    });

    fireEvent.click(getByTestId('delete-funding-source'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeVisible();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(
        queryByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeNull();
    });
  });

  it('shows error dialog with API error message when deleting a funding source fails', async () => {
    mockRestorationTrackerApi().project.deleteFundingSource = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText, getByTestId } = render(
      <DialogContextProvider>
        <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Funding Sources')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('delete-funding-source'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to remove this project funding source? It will also remove the associated survey funding source.'
        )
      ).toBeVisible();
    });

    fireEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
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

    /*
      Triggering onChange on Material UI Select elements
      https://stackoverflow.com/questions/55184037/react-testing-library-on-change-for-material-ui-select-component
    */
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
      expect(mockRestorationTrackerApi().project.addFundingSource).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });
});
