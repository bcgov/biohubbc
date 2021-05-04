import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import CreateSurveyPage from './CreateSurveyPage';
import { MemoryRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');

const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
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

      history.push('/home');
      history.push('/projects/1/survey/create');

      const { getByText, getAllByText } = render(
        <Router history={history}>
          <CreateSurveyPage />
        </Router>
      );

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Survey')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getAllByText('Yes')[2]);

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/projects/1/surveys');
      });
    });

    it('does nothing if the user clicks `No`', async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        species: [{ id: 1, name: 'species 1' }]
      } as any);

      const { getAllByText, getByText } = render(
        <MemoryRouter initialEntries={['?id=1']}>
          <CreateSurveyPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(getByText('Cancel Create Survey')).toBeInTheDocument();
        expect(getByText('Are you sure you want to cancel?')).toBeInTheDocument();
      });

      fireEvent.click(getAllByText('No')[2]);

      await waitFor(() => {
        expect(getAllByText('Create Survey').length).toEqual(2);
      });
    });
  });
});
