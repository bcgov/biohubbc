import { render } from '@testing-library/react';
import React from 'react';
import PublicLayout from './PublicLayout';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

describe('PublicLayout', () => {
  it('renders correctly', () => {
    process.env.REACT_APP_NODE_ENV = 'local';

    const { getByText } = render(
      <Router history={history}>
        <PublicLayout>
          <div>
            <p>The public layout content</p>
          </div>
        </PublicLayout>
      </Router>
    );

    expect(
      getByText('This is an unsupported browser. Some functionality may not work as expected.')
    ).toBeInTheDocument();
    expect(getByText('The public layout content')).toBeInTheDocument();
  });
});
