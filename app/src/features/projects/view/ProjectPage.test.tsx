import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  survey: {
    getSurveysList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveysList.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders project page when project is loaded', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }]
      } as any);

      const { asFragment, findByText } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
      expect(projectHeaderText).toBeVisible();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with no end date', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue({
        ...getProjectForViewResponse,
        project: {
          ...getProjectForViewResponse.project,
          end_date: (null as unknown) as string
        }
      });

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }]
      } as any);

      const { asFragment, findByText } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
      expect(projectHeaderText).toBeVisible();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project details when pathname includes /details', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }]
      } as any);

      history.push('/details');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project surveys when pathname includes /surveys', async () => {
    await act(async () => {
      const surveysList: IGetSurveysListResponse[] = [
        {
          id: 1,
          name: 'Moose Survey 1',
          species: ['Moose'],
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-05-09 11:53:53',
          status_name: 'Unpublished'
        },
        {
          id: 2,
          name: 'Moose Survey 2',
          species: ['Moose'],
          start_date: '2021-04-09 11:53:53',
          end_date: '2021-06-10 11:53:53',
          status_name: 'Published'
        }
      ];

      mockBiohubApi().survey.getSurveysList.mockResolvedValue(surveysList);
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }]
      } as any);

      history.push('/surveys');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project attachments when pathname includes /attachments', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }]
      } as any);

      history.push('/attachments');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
