import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { Router } from 'react-router';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import UsersDetailProjects from './UsersDetailProjects';

const history = createMemoryHistory();

vi.mock('../../../hooks/useBioHubApi');

const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  user: {
    getProjectList: vi.fn()
  },
  projectParticipants: {
    removeProjectParticipant: vi.fn(),
    updateProjectParticipantRole: vi.fn()
  },
  codes: {
    getAllCodeSets: vi.fn()
  }
};

const mockUser: ISystemUser = {
  system_user_id: 1,
  record_end_date: 'ending',
  user_identifier: 'testUser',
  role_names: ['system'],
  user_guid: '1111',
  identity_source: 'idir',
  role_ids: [],
  email: '',
  display_name: '',
  agency: ''
};

describe('UsersDetailProjects', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.user.getProjectList.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();
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

    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    mockUseApi.user.getProjectList.mockResolvedValue([]);

    const { getByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(0\)/);
      expect(getAllByText('No Projects').length).toEqual(1);
    });
  });

  it('renders list of a single project correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Coordinator' }]
    } as any);

    mockUseApi.user.getProjectList.mockResolvedValue([
      {
        project_participation_id: 4,
        project_id: 2,
        project_name: 'projectName',
        system_user_id: 1,
        project_role_ids: [3],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1']
      }
    ]);

    const { getAllByText, getByTestId } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(1\)/);
      expect(getAllByText('projectName').length).toEqual(1);
    });
  });

  it('renders list of a multiple projects correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Coordinator' }]
    } as any);

    mockUseApi.user.getProjectList.mockResolvedValue([
      {
        project_participation_id: 4,
        project_id: 1,
        project_name: 'projectName',
        system_user_id: 2,
        project_role_ids: [3],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1']
      },
      {
        project_participation_id: 8,
        project_id: 5,
        project_name: 'secondProjectName',
        system_user_id: 6,
        project_role_ids: [7],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1']
      }
    ]);

    const { getByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(2\)/);
      expect(getAllByText('projectName').length).toEqual(1);
      expect(getAllByText('secondProjectName').length).toEqual(1);
    });
  });

  it('routes to project id details on click', async () => {
    history.push('/admin/users/1');

    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }],
      project_roles: [{ id: 1, name: 'Coordinator' }]
    } as any);

    mockUseApi.user.getProjectList.mockResolvedValue([
      {
        project_participation_id: 4,
        project_id: 1,
        project_name: 'projectName',
        system_user_id: 2,
        project_role_ids: [3],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1']
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
    it('does nothing if the user clicks `Cancel` or away from the dialog', async () => {
      history.push('/admin/users/1');

      mockUseApi.codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [{ id: 1, name: 'Coordinator' }]
      } as any);

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 4,
          project_id: 1,
          project_name: 'projectName',
          system_user_id: 2,
          project_role_ids: [3],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1']
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
        expect(getAllByText('Remove user from project?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes User from project if the user clicks on `Remove` ', async () => {
      history.push('/admin/users/1');

      mockUseApi.codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [{ id: 1, name: 'Coordinator' }]
      } as any);

      mockUseApi.projectParticipants.removeProjectParticipant.mockResolvedValue(true);

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 4,
          project_id: 1,
          project_name: 'projectName',
          system_user_id: 2,
          project_role_ids: [3],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 8,
          project_id: 5,
          project_name: 'secondProjectName',
          system_user_id: 6,
          project_role_ids: [7],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1']
        }
      ]);

      const { getByTestId, getAllByText, getByText, getAllByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(2\)/);
        expect(getAllByText('projectName').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 8,
          project_id: 5,
          project_name: 'secondProjectName',
          system_user_id: 6,
          project_role_ids: [7],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1']
        }
      ]);

      fireEvent.click(getAllByTestId('remove-project-participant-button')[0]);

      await waitFor(() => {
        expect(getAllByText('Remove user from project?').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove'));

      await waitFor(() => {
        expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(1\)/);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });
    });
  });

  describe('Change users Project Role', () => {
    it('renders list of roles to change per project', async () => {
      history.push('/admin/users/1');

      mockUseApi.codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Coordinator' },
          { id: 2, name: 'Collaborator' },
          { id: 3, name: 'Observer' }
        ]
      } as any);

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 4,
          project_id: 1,
          project_name: 'projectName',
          system_user_id: 2,
          project_role_ids: [3],
          project_role_names: ['Role1'],
          project_role_permissions: ['Observer']
        }
      ]);

      const { getByTestId, getAllByText, getByText } = render(
        <Router history={history}>
          <UsersDetailProjects userDetails={mockUser} />
        </Router>
      );

      await waitFor(() => {
        expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(1\)/);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Observer'));

      await waitFor(() => {
        expect(getAllByText('Coordinator').length).toEqual(1);
        expect(getAllByText('Collaborator').length).toEqual(1);
        expect(getAllByText('Observer').length).toEqual(2);
      });
    });

    it('renders dialog pop on role selection, does nothing if user clicks `Cancel` ', async () => {
      history.push('/admin/users/1');

      mockUseApi.codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Coordinator' },
          { id: 2, name: 'Collaborator' },
          { id: 3, name: 'Observer' }
        ]
      } as any);

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 4,
          project_id: 1,
          project_name: 'projectName',
          system_user_id: 2,
          project_role_ids: [3],
          project_role_names: ['Role1'],
          project_role_permissions: ['Observer']
        }
      ]);

      const { getByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(1\)/);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Observer'));

      await waitFor(() => {
        expect(getAllByText('Coordinator').length).toEqual(1);
        expect(getAllByText('Collaborator').length).toEqual(1);
        expect(getAllByText('Observer').length).toEqual(2);
      });

      fireEvent.click(getByText('Collaborator'));

      await waitFor(() => {
        expect(getAllByText('Change project role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('renders dialog pop on role selection, Changes role on click of `Change Role` ', async () => {
      history.push('/admin/users/1');

      mockUseApi.codes.getAllCodeSets.mockResolvedValue({
        coordinator_agency: [{ id: 1, name: 'agency 1' }],
        project_roles: [
          { id: 1, name: 'Coordinator' },
          { id: 2, name: 'Collaborator' },
          { id: 3, name: 'Observer' }
        ]
      } as any);

      mockUseApi.user.getProjectList.mockResolvedValue([
        {
          project_participation_id: 4,
          project_id: 1,
          project_name: 'projectName',
          system_user_id: 2,
          project_role_ids: [3],
          project_role_names: ['Role1'],
          project_role_permissions: ['Observer']
        }
      ]);

      mockUseApi.projectParticipants.updateProjectParticipantRole.mockResolvedValue(true);

      const { getByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getByTestId('projects_header').textContent).toMatch(/Assigned Projects.*\(1\)/);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Observer'));

      await waitFor(() => {
        expect(getAllByText('Coordinator').length).toEqual(1);
        expect(getAllByText('Collaborator').length).toEqual(1);
        expect(getAllByText('Observer').length).toEqual(2);
      });

      fireEvent.click(getByText('Collaborator'));

      await waitFor(() => {
        expect(getAllByText('Change project role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Change Role'));

      await waitFor(() => {
        expect(getAllByText('Collaborator').length).toEqual(1);
      });
    });
  });
});
