import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import ProjectsListPage from './ProjectsListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectsList: jest.fn()
  },
  draft: {
    getDraftsList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi().project.getProjectsList.mockClear();
    mockBiohubApi().draft.getDraftsList.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with the create project button', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const { baseElement } = render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(baseElement).toHaveTextContent('Create Project');
    });
  });

  test('renders with the open advanced filters button', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const { getByText } = render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Show Filters')).toBeInTheDocument();
    });
  });

  test('renders with a proper list of projects when published and completed', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'coordinator agency',
        project_type: 'project type',
        permits_list: '1, 2, 3',
        publish_status: 'Published',
        completion_status: 'Completed'
      }
    ]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('renders with a proper list of projects when unpublished and active', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'coordinator agency',
        project_type: 'project type',
        permits_list: '1, 2, 3',
        publish_status: 'Unpublished',
        completion_status: 'Active'
      }
    ]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('renders with a list of drafts', async () => {
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([
      {
        id: 1,
        name: 'Draft 1'
      }
    ]);
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('navigating to the create project page works', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const { getByText, getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Create Project'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('');
    });
  });

  test('navigating to the create project page works on draft projects', async () => {
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([
      {
        id: 1,
        name: 'Draft 1'
      }
    ]);

    const { getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Draft 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('?draftId=1');
    });
  });

  test('navigating to the project works', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'coordinator agency',
        project_type: 'project type',
        permits_list: '1, 2, 3',
        publish_status: 'Published',
        completion_status: 'Completed'
      }
    ]);

    const { getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Project 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1');
    });
  });
});
