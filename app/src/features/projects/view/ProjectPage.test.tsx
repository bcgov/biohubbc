import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPage from './ProjectPage';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory({ initialEntries: ['/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>(),
    deleteProject: jest.fn(),
    publishProject: jest.fn()
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
    mockBiohubApi().project.deleteProject.mockClear();
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveysList.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().project.publishProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders project page when project is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('delete project works and takes user to the projects list page', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().project.deleteProject.mockResolvedValue(true);

    const { getByTestId, findByText, getByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    fireEvent.click(getByTestId('delete-project-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this project, its attachments and associated surveys/observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects`);
    });
  });

  it('renders correctly with no end date', async () => {
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

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('publishes and unpublishes a project', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, publish_date: '' }
    });
    mockBiohubApi().project.publishProject.mockResolvedValue({ id: 1 });

    const { getByTestId, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const publishButtonText1 = await findByText('Publish Project');
    expect(publishButtonText1).toBeVisible();

    //re-mock response to return the project with a non-null publish date
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, publish_date: '2021-10-10' }
    });

    fireEvent.click(getByTestId('publish-project-button'));

    const unpublishButtonText = await findByText('Unpublish Project');
    expect(unpublishButtonText).toBeVisible();

    //re-mock response to return the project with a null publish date
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, publish_date: '' }
    });

    fireEvent.click(getByTestId('publish-project-button'));

    const publishButtonText2 = await findByText('Publish Project');
    expect(publishButtonText2).toBeVisible();
  });
});
