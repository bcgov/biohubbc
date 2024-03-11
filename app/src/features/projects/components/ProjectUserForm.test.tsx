import { PROJECT_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { fireEvent, render, waitFor, within } from 'test-helpers/test-utils';
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

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  user: {
    searchSystemUser: jest.fn<Promise<ISystemUser[]>, []>()
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

  it('renders newly added users properly', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const formikInitialValues = {
      participants: []
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
      const autocomplete = getByTestId('autocomplete-user-role-search');
      const input = within(autocomplete).getByPlaceholderText('Find team members');

      // Search for a user
      fireEvent.change(input, { target: { value: 'Test User' } });
      // Arrow down to user in field
      fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
      // select the first item
      fireEvent.keyDown(autocomplete, { key: 'Enter' });

      expect(getByTestId('autocomplete-user-role-search')).toBeVisible();
      expect(getByText('Test User')).toBeVisible();
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
