import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
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

    const { asFragment } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Logout', () => {
    const { location } = window;

    beforeAll(() => {
      // @ts-ignore
      delete window.location;

      // @ts-ignore
      window.location = {
        href: '',
        origin: ''
      };
    });

    afterAll(() => {
      window.location = location;
    });

    it('should not logout when no config provided', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const target = 'https://example.com/';

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <ConfigContext.Provider value={(null as unknown) as IConfig}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      await waitFor(() => {
        expect(window.location.href).toBe(target);
      });
    });

    it('should change the location.href appropriately on logout success', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }],
        regional_offices: [{ id: 1, name: 'Office 1' }]
      });

      const target = 'https://example.com/';
      const config = {
        API_HOST: '',
        CHANGE_VERSION: '',
        NODE_ENV: '',
        VERSION: '',
        KEYCLOAK_CONFIG: {
          url: 'https://www.mylogoutworks.com/auth',
          realm: 'myrealm',
          clientId: ''
        }
      };

      window.location.href = target;

      expect(window.location.href).toBe(target);

      const { getByText } = render(
        <ConfigContext.Provider value={config}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      await waitFor(() => {
        expect(window.location.href).toEqual(
          'https://www.mylogoutworks.com/auth/realms/myrealm/protocol/openid-connect/logout?redirect_uri=' +
            encodeURI(window.location.origin) +
            '/access-request'
        );
      });
    });
  });

  it('shows and hides the regional offices section when the regional offices radio button is selected (respectively)', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      regional_offices: [{ id: 1, name: 'Office 1' }]
    });

    const { queryByText, getByText, getByTestId } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

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

    const { getByText, getAllByRole, getByRole, getByTestId } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

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
      ready: true,
      keycloakWrapper: {
        keycloak: {},
        hasLoadedUserRelevantInfo: true,
        systemRoles: [],
        getUserIdentifier: jest.fn(),
        hasAccessRequest: true,
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

    const { getByText, getAllByRole, getByRole, getByTestId, queryByText } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

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

    const { getByText, getAllByRole, getByRole, getByTestId, queryByText } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

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
