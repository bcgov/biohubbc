import { PROJECT_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import ProjectUserForm, { ProjectUserRoleYupSchema } from './ProjectUserForm';

const mockRoles: ICode[] = [
  {
    id: 1,
    name: PROJECT_ROLE.COLLABORATOR
  },
  {
    id: 2,
    name: PROJECT_ROLE.COORDINATOR
  },
  {
    id: 3,
    name: PROJECT_ROLE.OBSERVER
  }
];

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  user: {
    searchSystemUser: vi.fn()
  }
};

describe('ProjectUserForm', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.user.searchSystemUser.mockClear();

    mockUseApi.user.searchSystemUser.mockResolvedValue([
      {
        system_user_id: 1,
        user_identifier: 'identifier',
        user_guid: '',
        identity_source: 'IDIR',
        record_end_date: '',
        role_ids: [],
        role_names: [],
        email: 'user@email.com',
        display_name: 'Test User',
        agency: 'Business'
      },
      {
        system_user_id: 2,
        user_identifier: 'identifier',
        user_guid: '',
        identity_source: 'IDIR',
        record_end_date: '',
        role_ids: [],
        role_names: [],
        email: 'user@email.com',
        display_name: 'Jim Testy',
        agency: 'Business'
      }
    ]);
  });

  it('renders correctly with default values', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const formikInitialValues = {
      participants: [
        {
          system_user_id: 1,
          user_identifier: 'identifier',
          user_guid: '',
          identity_source: 'IDIR',
          record_end_date: '',
          role_ids: [],
          role_names: [],
          email: 'user@email.com',
          display_name: 'Test User',
          agency: 'Business',
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        }
      ]
    };

    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={formikInitialValues}
          validationSchema={ProjectUserRoleYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          <ProjectUserForm roles={mockRoles} />
        </Formik>
      </AuthStateContext.Provider>
    );

    await waitFor(async () => {
      expect(getByTestId('autocomplete-user-role-search')).toBeVisible();
      expect(getByText('Test User', { exact: false })).toBeVisible();
    });
  });

  it('renders removing a user', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const formikInitialValues = {
      participants: [
        {
          system_user_id: 1,
          user_identifier: 'identifier',
          user_guid: '',
          identity_source: 'IDIR',
          record_end_date: '',
          role_ids: [],
          role_names: [],
          email: 'user@email.com',
          display_name: 'Test User',
          agency: 'Business',
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        }
      ]
    };

    const { getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={formikInitialValues}
          validationSchema={ProjectUserRoleYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          <ProjectUserForm roles={mockRoles} />
        </Formik>
      </AuthStateContext.Provider>
    );

    await waitFor(async () => {
      expect(getByTestId('autocomplete-user-role-search')).toBeVisible();
      expect(getByTestId('remove-user-role-button-0')).toBeVisible();
    });
  });
});
