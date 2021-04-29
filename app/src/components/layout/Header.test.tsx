import { render } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import Header from './Header';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly with project admin role', () => {
    const mockHasSystemRole = () => false;

    const authState = {
      ready: true,
      keycloakWrapper: {
        keycloak: {},
        hasLoadedUserRelevantInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
        getUserIdentifier: jest.fn(),
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast'
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
    const mockHasSystemRole = () => true;

    const authState = {
      ready: true,
      keycloakWrapper: {
        keycloak: {},
        hasLoadedUserRelevantInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: jest.fn(),
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast'
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
});
