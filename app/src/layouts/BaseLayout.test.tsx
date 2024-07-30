import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { render } from 'test-helpers/test-utils';
import BaseLayout from './BaseLayout';

const history = createMemoryHistory();

describe('BaseLayout', () => {
  it('renders correctly', () => {
    import.meta.env.VITE_APP_NODE_ENV = 'local';

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <BaseLayout>
            <div>
              <p>The base layout content</p>
            </div>
          </BaseLayout>
        </Router>
      </AuthStateContext.Provider>
    );

    expect(
      getByText('This is an unsupported browser. Some functionality may not work as expected.')
    ).toBeInTheDocument();
    expect(getByText('The base layout content')).toBeInTheDocument();
  });
});
