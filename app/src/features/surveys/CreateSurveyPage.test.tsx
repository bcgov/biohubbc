import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import CreateSurveyPage from './CreateSurveyPage';
import { MemoryRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');

const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  survey: {
    getSurveyPermits: jest.fn(),
    getSurveyFundingSources: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('CreateSurveyPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().survey.getSurveyPermits.mockClear();
    mockBiohubApi().survey.getSurveyFundingSources.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when codes and project data not yet loaded', async () => {
    const { asFragment } = render(
      <MemoryRouter initialEntries={['?id=1']}>
        <CreateSurveyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly when codes and project data are loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      species: [{ id: 1, name: 'species 1' }]
    } as any);

    mockBiohubApi().survey.getSurveyPermits.mockResolvedValue([
      { number: '123', type: 'Scientific' },
      { number: '456', type: 'Wildlife' }
    ]);

    mockBiohubApi().survey.getSurveyFundingSources.mockResolvedValue([
      { pfsId: 1, amount: 100, startDate: '2000-04-09 11:53:53', endDate: '2000-05-10 11:53:53', agencyName: 'agency' }
    ]);

    const { asFragment, getAllByText } = render(
      <MemoryRouter initialEntries={['?id=1']}>
        <CreateSurveyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getAllByText('Create Survey').length).toEqual(2);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Are you sure? Dialog', () => {
    it('calls history.push() if the user clicks `Yes`', async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        species: [{ id: 1, name: 'species 1' }]
      } as any);

      mockBiohubApi().survey.getSurveyPermits.mockResolvedValue([
        { number: '123', type: 'Scientific' },
        { number: '456', type: 'Wildlife' }
      ]);

      mockBiohubApi().survey.getSurveyFundingSources.mockResolvedValue([
        {
          pfsId: 1,
          amount: 100,
          startDate: '2000-04-09 11:53:53',
          endDate: '2000-05-10 11:53:53',
          agencyName: 'agency'
        }
      ]);

      history.push('/home');
      history.push('/projects/1/survey/create');

      const { getByText, getAllByText, getByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <CreateSurveyPage />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Survey')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getByTestId('yes-button'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/projects/1/surveys');
      });
    });

    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        species: [{ id: 1, name: 'species 1' }]
      } as any);

      mockBiohubApi().survey.getSurveyPermits.mockResolvedValue([
        { number: '123', type: 'Scientific' },
        { number: '456', type: 'Wildlife' }
      ]);

      mockBiohubApi().survey.getSurveyFundingSources.mockResolvedValue([
        {
          pfsId: 1,
          amount: 100,
          startDate: '2000-04-09 11:53:53',
          endDate: '2000-05-10 11:53:53',
          agencyName: 'agency'
        }
      ]);

      const { getAllByText, getByText, getAllByRole, getByTestId } = render(
        <DialogContextProvider>
          <MemoryRouter initialEntries={['?id=1']}>
            <CreateSurveyPage />
          </MemoryRouter>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Survey')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getByTestId('no-button'));

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Survey')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      // Get the backdrop, then get the firstChild because this is where the event listener is attached
      //@ts-ignore
      fireEvent.click(getAllByRole('presentation')[0].firstChild);

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });
    });
  });
});
