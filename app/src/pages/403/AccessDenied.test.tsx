import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import AccessDenied from './AccessDenied';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <AccessDenied />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
