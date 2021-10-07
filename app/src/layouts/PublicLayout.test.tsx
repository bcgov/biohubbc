import { render } from '@testing-library/react';
import React from 'react';
import PublicLayout from './PublicLayout';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

describe('PublicLayout', () => {
  it('renders correctly with environment tag', () => {
    process.env.REACT_APP_NODE_ENV = 'local';

    const { asFragment } = render(
      <Router history={history}>
        <PublicLayout>
          <div>
            <p>The public layout content</p>
          </div>
        </PublicLayout>
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly without environment tag (when prod)', () => {
    process.env.REACT_APP_NODE_ENV = 'prod';

    const { asFragment } = render(
      <Router history={history}>
        <PublicLayout>
          <div>
            <p>The public layout content</p>
          </div>
        </PublicLayout>
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
