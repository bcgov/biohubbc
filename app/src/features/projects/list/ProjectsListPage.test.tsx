import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import ProjectsListPage from './ProjectsListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { act } from 'react-dom/test-utils';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectsList: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi().project.getProjectsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with the create project button', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

      const { baseElement } = render(
        <MemoryRouter>
          <ProjectsListPage />
        </MemoryRouter>
      );

      expect(baseElement).toHaveTextContent('Create Project');
    });
  });

  test('renders with a proper list of projects', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectsList.mockResolvedValue([
        {
          id: 1,
          name: 'Project 1',
          focal_species_name_list: null,
          location_description: 'location',
          regions_name_list: 'South Coast',
          start_date: '2021-03-16T00:00:00.000Z',
          end_date: null
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
  });

  test('navigating to the create project page works', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

      const { getByText } = render(
        <Router history={history}>
          <ProjectsListPage />
        </Router>
      );

      fireEvent.click(getByText('Create Project'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/projects/create');
      });
    });
  });

  test('navigating to the project works', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectsList.mockResolvedValue([
        {
          id: 1,
          name: 'Project 1',
          focal_species_name_list: null,
          location_description: 'location',
          regions_name_list: 'South Coast',
          start_date: '2021-03-16T00:00:00.000Z',
          end_date: null
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
        expect(history.location.pathname).toEqual('/projects/1');
      });
    });
  });
});
