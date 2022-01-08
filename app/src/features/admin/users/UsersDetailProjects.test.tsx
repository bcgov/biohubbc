import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import UsersDetailProjects from './UsersDetailProjects';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');

const mockuseRestorationTrackerApi = {
  project: {
    getAllUserProjectsForView: jest.fn<Promise<IGetUserProjectsListResponse[]>, []>(),
    removeProjectParticipant: jest.fn<Promise<boolean>, []>(),
    updateProjectParticipantRole: jest.fn<Promise<boolean>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockUser = {
  id: 1,
  user_record_end_date: 'ending',
  user_identifier: 'testUser',
  role_names: ['system']
};

describe('UsersDetailProjects', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getAllUserProjectsForView.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when assignedProjects not yet loaded', async () => {
    history.push('/admin/users/1');

    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('project-loading').length).toEqual(1);
    });
  });

  it('renders empty list correctly when assignedProjects empty and loaded', async () => {
    history.push('/admin/users/1');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue({
      assignedProjects: []
    } as any);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects ()').length).toEqual(1);
      expect(getAllByText('No Projects').length).toEqual(1);
    });
  });

  it('renders list of a single project correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Project Lead' }]
    } as any);

    mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
      {
        project_id: 2,
        name: 'projectName',
        system_user_id: 1,
        project_role_id: 3,
        project_participation_id: 4
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
    });
  });

  it('renders list of a multiple projects correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Project Lead' }]
    } as any);

    mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 3,
        project_participation_id: 4
      },
      {
        project_id: 5,
        name: 'secondProjectName',
        system_user_id: 6,
        project_role_id: 7,
        project_participation_id: 8
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
      expect(getAllByText('secondProjectName').length).toEqual(1);
    });
  });

  it('routes to project id details on click', async () => {
    history.push('/admin/users/1');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Project Lead' }]
    } as any);

    mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 3,
        project_participation_id: 4
      }
    ]);

    const { getAllByText, getByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByText('projectName').length).toEqual(1);
    });

    fireEvent.click(getByText('projectName'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1/details');
    });
  });

  describe('Are you sure? Dialog', () => {
    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      history.push('/admin/users/1');

      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [{ id: 1, name: 'Project Lead' }]
      } as any);

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByTestId, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByTestId('remove-project-participant-button'));

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('No'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes User from project if the user clicks on `Yes` ', async () => {
      history.push('/admin/users/1');

      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [{ id: 1, name: 'Project Lead' }]
      } as any);

      mockRestorationTrackerApi().project.removeProjectParticipant.mockResolvedValue(true);

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 3,
          project_participation_id: 4
        },
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      const { getAllByText, getByText, getAllByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      fireEvent.click(getAllByTestId('remove-project-participant-button')[0]);

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('Yes'));

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });
    });
  });

  describe('Change users Project Role', () => {
    it('renders list of roles to change per project', async () => {
      history.push('/admin/users/1');

      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Project Lead' },
          { id: 2, name: 'Editor' },
          { id: 3, name: 'Viewer' }
        ]
      } as any);

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <Router history={history}>
          <UsersDetailProjects userDetails={mockUser} />
        </Router>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });
    });

    it('renders dialog pop on role selection, does nothing if user clicks `Cancel` ', async () => {
      history.push('/admin/users/1');

      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Project Lead' },
          { id: 2, name: 'Editor' },
          { id: 3, name: 'Viewer' }
        ]
      } as any);

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('renders dialog pop on role selection, Changes role on click of `Change Role` ', async () => {
      history.push('/admin/users/1');

      mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Project Lead' },
          { id: 2, name: 'Editor' },
          { id: 3, name: 'Viewer' }
        ]
      } as any);

      mockRestorationTrackerApi().project.getAllUserProjectsForView.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      mockRestorationTrackerApi().project.updateProjectParticipantRole.mockResolvedValue(true);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Change Role'));

      await waitFor(() => {
        expect(getAllByText('Editor').length).toEqual(1);
      });
    });
  });
});
