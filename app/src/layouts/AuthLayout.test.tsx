import { render } from '@testing-library/react';
import React from 'react';
import AuthLayout from './AuthLayout';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

describe('AuthLayout', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <AuthLayout>
          <div>
            <p>The public layout content</p>
          </div>
        </AuthLayout>
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
