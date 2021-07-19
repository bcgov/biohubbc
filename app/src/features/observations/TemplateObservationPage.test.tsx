import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Route, Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import TemplateObservationPage from './TemplateObservationPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1/surveys/1/observations/template'] });

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

describe('TemplateObservationPage', () => {
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
        <TemplateObservationPage />
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
        <TemplateObservationPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const updatedHistory = createMemoryHistory({ initialEntries: ['/projects/1/surveys/1/observations/template'] });

    const { asFragment, getByTestId } = render(
      <Router history={updatedHistory}>
        <Route path="/projects/:id/surveys/:survey_id/observations/template">
          <TemplateObservationPage />
        </Route>
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('template-observation-heading')).toBeInTheDocument();
      expect(getByTestId('back-button')).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
