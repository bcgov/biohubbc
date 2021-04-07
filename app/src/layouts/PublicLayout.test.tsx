import { render } from '@testing-library/react';
import React from 'react';
import PublicLayout from './PublicLayout';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

describe('PublicLayout', () => {
  it('renders correctly with no error message', () => {
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
