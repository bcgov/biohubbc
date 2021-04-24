import { fireEvent, render } from '@testing-library/react';
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

  it('redirects to the access-request page appropriately', () => {
    const { getByText } = render(
      <Router history={history}>
        <AccessDenied />
      </Router>
    );

    fireEvent.click(getByText('Request Access'));

    expect(history.location.pathname).toEqual('/access-request');
  });
});
