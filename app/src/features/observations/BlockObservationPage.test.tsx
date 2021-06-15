import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import BlockObservationPage from './BlockObservationPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1/surveys/1/observations/create'] });

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, [number]>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('BlockObservationPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveyForView.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const { asFragment } = render(
      <Router history={history}>
        <BlockObservationPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no survey is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

    const { asFragment } = render(
      <Router history={history}>
        <BlockObservationPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders the page contents with the form when project and survey are loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const { asFragment, getByTestId } = render(
      <Router history={history}>
        <BlockObservationPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('block-observation-heading')).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
