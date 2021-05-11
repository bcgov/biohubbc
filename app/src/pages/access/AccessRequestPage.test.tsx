import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import * as utils from 'utils/Utils';
import AccessRequestPage from './AccessRequestPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  admin: {
    createAdministrativeActivity: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = () => {
  const authState = {
    keycloakWrapper: {
      keycloak: {
        authenticated: true
      },
      hasLoadedAllUserInfo: true,
      hasAccessRequest: false,

      systemRoles: [],
      getUserIdentifier: jest.fn(),
      hasSystemRole: jest.fn(),
      getIdentitySource: jest.fn(),
      username: 'testusername',
      displayName: 'testdisplayname',
      email: 'test@email.com',
      firstName: 'testfirst',
      lastName: 'testlast'
    }
  };

  return render(
    <AuthStateContext.Provider value={authState}>
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    </AuthStateContext.Provider>
  );
};

describe('AccessRequestPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().admin.createAdministrativeActivity.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    const { asFragment } = renderContainer();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Log Out', () => {
    const history = createMemoryHistory();

    let logOutSpy: jest.SpyInstance;

    beforeAll(() => {
      logOutSpy = jest.spyOn(utils, 'logOut').mockReturnValue();
    });

    afterAll(() => {
      logOutSpy.mockClear();

      cleanup();
    });

    it('should not logout when no config provided', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const authState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          },
          hasLoadedAllUserInfo: true,
          hasAccessRequest: false,

          systemRoles: [],
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          firstName: 'testfirst',
          lastName: 'testlast'
        }
      };

      const { getByText } = render(
        <ConfigContext.Provider value={(null as unknown) as IConfig}>
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AccessRequestPage />
            </Router>
          </AuthStateContext.Provider>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      expect(logOutSpy).not.toBeCalled();
    });

    it('should logout when config provided', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const config = {
        API_HOST: '',
        CHANGE_VERSION: '',
        NODE_ENV: '',
        VERSION: '',
        KEYCLOAK_CONFIG: {
          url: 'https://www.mylogoutworks.com/auth',
          realm: 'myrealm',
          clientId: ''
        },
        SITEMINDER_LOGOUT_URL: 'https://www.siteminderlogout.com'
      };

      const authState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          },
          hasLoadedAllUserInfo: true,
          hasAccessRequest: false,

          systemRoles: [],
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          firstName: 'testfirst',
          lastName: 'testlast'
        }
      };

      const { getByText } = render(
        <ConfigContext.Provider value={config}>
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AccessRequestPage />
            </Router>
          </AuthStateContext.Provider>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      expect(logOutSpy).toBeCalledTimes(1);
    });
  });

  it('shows and hides the regional offices section when the regional offices radio button is selected (respectively)', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    const { queryByText, getByText, getByTestId } = renderContainer();

    expect(queryByText('Which Regional Offices do you work for?')).toBeNull();

    fireEvent.click(getByTestId('yes-regional-office'));

    await waitFor(() => {
      expect(getByText('Which Regional Offices do you work for?')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('no-regional-office'));

    expect(queryByText('Which Regional Offices do you work for?')).toBeNull();
  });

  it('processes a successful request submission', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: 1
    });

    const { getByText, getAllByRole, getByRole, getByTestId } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText(/Role 1/i)).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText(/Role 1/i));
    fireEvent.click(getByTestId('no-regional-office'));
    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/request-submitted');
    });
  });

  it('takes the user to the request-submitted page immediately if they already have an access request', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        hasAccessRequest: false,

        systemRoles: [],
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: '',
        displayName: '',
        email: '',
        firstName: '',
        lastName: ''
      }
    };

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessRequestPage />
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/request-submitted');
    });
  });

  it('shows error dialog with api error message when submission fails', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getAllByRole, getByRole, getByTestId, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText(/Role 1/i)).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText(/Role 1/i));
    fireEvent.click(getByTestId('no-regional-office'));
    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it('shows error dialog with default error message when response from createAdministrativeActivity is invalid', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: null
    });

    const { getByText, getAllByRole, getByRole, getByTestId, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText(/Role 1/i)).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText(/Role 1/i));
    fireEvent.click(getByTestId('no-regional-office'));
    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeNull();
    });
  });
});
