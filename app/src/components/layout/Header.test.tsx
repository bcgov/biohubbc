import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import * as utils from 'utils/Utils';
import Header from './Header';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly with project admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole
      .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
      .mockReturnValueOnce(false); // Return false when the `Manage Users` secure link is parsed

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => 'idir',
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

    const { getByText, queryByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(queryByText('Manage Users')).not.toBeInTheDocument();
  });

  it('renders correctly with system admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole
      .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
      .mockReturnValueOnce(true); // Return true when the `Manage Users` secure link is parsed

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => 'bceid',
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders the username and logout button', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: jest.fn(),
        getIdentitySource: () => 'bceid',
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByTestId('menu_log_out')).toBeVisible();

    expect(getByText('BCEID / TESTUSER')).toBeVisible();
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

      const { getByTestId } = render(
        <ConfigContext.Provider value={(null as unknown) as IConfig}>
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <Header />
            </Router>
          </AuthStateContext.Provider>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByTestId('menu_log_out'));

      waitFor(() => {
        expect(logOutSpy).not.toBeCalled();
      });
    });

    it('should logout when config provided', async () => {
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
          lastName: 'testlast',
          refresh: () => {}
        }
      };

      const { getByTestId } = render(
        <ConfigContext.Provider value={config}>
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <Header />
            </Router>
          </AuthStateContext.Provider>
        </ConfigContext.Provider>
      );

      fireEvent.click(getByTestId('menu_log_out'));

      waitFor(() => {
        expect(logOutSpy).toBeCalledTimes(1);
      });
    });
  });
});
