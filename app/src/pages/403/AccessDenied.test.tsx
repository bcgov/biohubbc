import { fireEvent, render } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import AccessDenied from './AccessDenied';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly when the user has no role', () => {
    const mockHasSystemRole = () => true;

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
        getUserIdentifier: jest.fn(),
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: jest.fn(),
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
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(queryByText('Request Access')).not.toBeInTheDocument();
  });

  it('redirects to the access-request page appropriately', () => {
    const mockHasSystemRole = () => false;

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        getUserIdentifier: jest.fn(),
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
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
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('You do not have permission to access this application.')).toBeVisible();
    expect(getByText('Request Access')).toBeVisible();

    fireEvent.click(getByText('Request Access'));

    expect(history.location.pathname).toEqual('/access-request');
  });
});
