import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

const history = createMemoryHistory();

describe('NotFoundPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <NotFoundPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
