import { AuthStateContext } from 'contexts/authStateContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { fireEvent, render, waitFor, within } from 'test-helpers/test-utils';
import SurveyUserForm, { SurveyUserJobFormInitialValues, SurveyUserJobYupSchema } from './SurveyUserForm';

const roles: ICode[] = [
  {
    id: 1,
    name: 'Pilot'
  },
  {
    id: 2,
    name: 'Biologist'
  }
];

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  user: {
    searchSystemUser: jest.fn<Promise<ISystemUser[]>, []>()
  }
};

describe('SurveyUserForm', () => {
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
    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={SurveyUserJobFormInitialValues}
          validationSchema={SurveyUserJobYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          <SurveyUserForm
            users={[
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
                survey_job_id: 1,
                survey_job_name: 'Pilot'
              }
            ]}
            jobs={roles}
          />
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
    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={SurveyUserJobFormInitialValues}
          validationSchema={SurveyUserJobYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          <SurveyUserForm users={[]} jobs={roles} />
        </Formik>
      </AuthStateContext.Provider>
    );

    await waitFor(async () => {
      const autocomplete = getByTestId('autocomplete-user-role-search');
      const input = within(autocomplete).getByPlaceholderText('Find people');

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
    const { getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Formik
          initialValues={SurveyUserJobFormInitialValues}
          validationSchema={SurveyUserJobYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async () => {}}>
          <SurveyUserForm
            users={[
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
                survey_job_id: 1,
                survey_job_name: ''
              }
            ]}
            jobs={roles}
          />
        </Formik>
      </AuthStateContext.Provider>
    );

    await waitFor(async () => {
      expect(getByTestId('autocomplete-user-role-search')).toBeVisible();
      expect(getByTestId('remove-user-role-button-0')).toBeVisible();
    });
  });
});
