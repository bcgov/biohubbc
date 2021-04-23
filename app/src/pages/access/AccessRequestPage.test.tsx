import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import AccessRequestPage from './AccessRequestPage';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <AccessRequestPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
