import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
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
      lastName: 'testlast',
      refresh: () => {}
    }
  };

  return render(
    <AuthStateContext.Provider value={authState as any}>
      <DialogContextProvider>
        <Router history={history}>
          <AccessRequestPage />
        </Router>
      </DialogContextProvider>
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
      system_roles: [{ id: 1, name: 'Role 1' }]
    });

    const { asFragment } = renderContainer();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Log Out', () => {
    const history = createMemoryHistory();

    it('should redirect to `/logout`', async () => {
      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        system_roles: [{ id: 1, name: 'Role 1' }]
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
          lastName: 'testlast',
          refresh: () => {}
        }
      };

      const { getByText } = render(
        <AuthStateContext.Provider value={authState as any}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </AuthStateContext.Provider>
      );

      fireEvent.click(getByText('Log out'));

      waitFor(() => {
        expect(history.location.pathname).toEqual('/logout');
      });
    });
  });

  it('processes a successful request submission', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: 1
    });

    const { getByText, getAllByRole, getByRole } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/request-submitted');
    });
  });

  it('takes the user to the request-submitted page immediately if they already have an access request', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      system_roles: [{ id: 1, name: 'Creator' }]
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
        lastName: '',
        refresh: () => {}
      }
    };

    render(
      <AuthStateContext.Provider value={authState as any}>
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
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

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
      system_roles: [{ id: 1, name: 'Creator' }]
    });

    mockBiohubApi().admin.createAdministrativeActivity.mockResolvedValue({
      id: null
    });

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

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
