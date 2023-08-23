import { createMemoryHistory } from 'history';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { Router } from 'react-router';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { ISystemUser } from '../../../interfaces/useUserApi.interface';
import UsersDetailPage from './UsersDetailPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');

const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  user: {
    getUserById: jest.fn<Promise<ISystemUser>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  project: {
    getAllUserProjectsForView: jest.fn<Promise<IGetUserProjectsListResponse>, []>()
  }
};

describe('UsersDetailPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.user.getUserById.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when selectedUser not yet loaded', async () => {
    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailPage />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('page-loading').length).toEqual(1);
    });
  });

  it('renders correctly when selectedUser are loaded', async () => {
    history.push('/admin/users/1');

    mockUseApi.user.getUserById.mockResolvedValue({
      system_user_id: 1,
      user_identifier: 'LongerUserName',
      record_end_date: 'end',
      role_names: ['role1', 'role2'],
      user_guid: '',
      identity_source: 'idir',
      role_ids: [],
      email: '',
      display_name: '',
      agency: ''
    });

    mockUseApi.project.getAllUserProjectsForView.mockResolvedValue({
      project_participation_id: 3,
      project_id: 321,
      project_name: 'test',
      system_user_id: 1,
      project_role_ids: [2],
      project_role_names: ['Role1'],
      project_permission_names: ['Permission1']
    });

    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailPage />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
    });
  });
});
