import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import PublicProjectsListPage from './PublicProjectsListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  public: {
    project: {
      getProjectsList: jest.fn()
    }
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('PublicProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi().public.project.getProjectsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with a proper list of projects when completed', async () => {
    mockBiohubApi().public.project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'coordinator agency',
        project_type: 'project type',
        permits_list: '1, 2, 3',
        completion_status: 'Completed'
      }
    ]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <PublicProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test('renders with a proper list of projects when active', async () => {
    mockBiohubApi().public.project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'coordinator agency',
        project_type: 'project type',
        permits_list: '1, 2, 3',
        completion_status: 'Active'
      }
    ]);

    const { asFragment, getByTestId } = render(
      <MemoryRouter>
        <PublicProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
