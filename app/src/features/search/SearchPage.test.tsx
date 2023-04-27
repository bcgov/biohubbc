import { render } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import SearchPage from './SearchPage';

const history = createMemoryHistory();

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('SearchPage', () => {
  it('renders correctly', () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <SearchPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Map')).toBeInTheDocument();
  });
});
