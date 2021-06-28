import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Route, Router } from 'react-router';
import { getObservationForCreateUpdateResponse } from 'test-helpers/observation-helpers';
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
  },
  observation: {
    getObservationForUpdate: jest.fn()
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
    mockBiohubApi().observation.getObservationForUpdate.mockClear();
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

  it('renders the empty page contents (Add Block Observation) with the form when project and survey are loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const { asFragment, getByTestId } = render(
      <Router history={history}>
        <Route path="/projects/:id/surveys/:survey_id/observations/create">
          <BlockObservationPage />
        </Route>
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('block-observation-heading')).toBeInTheDocument();
      expect(getByTestId('save-and-exit-button')).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the filled page contents (Edit Block Observation) with the form when project, survey and observation are loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().observation.getObservationForUpdate.mockResolvedValue(getObservationForCreateUpdateResponse);

    const updatedHistory = createMemoryHistory({ initialEntries: ['/projects/1/surveys/1/observations/1/block'] });

    const { asFragment, getByTestId } = render(
      <Router history={updatedHistory}>
        <Route path="/projects/:id/surveys/:survey_id/observations/:observation_id/block">
          <BlockObservationPage />
        </Route>
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('block-observation-heading')).toBeInTheDocument();
      expect(getByTestId('save-changes-button')).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
