import { render } from '@testing-library/react';
import React from 'react';
import SearchPage from './SearchPage';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

const history = createMemoryHistory();

jest.spyOn(console, 'debug').mockImplementation(() => {});

describe('SearchPage', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <SearchPage />
      </Router>
    );

    expect(getByText('Map')).toBeInTheDocument();
  });
});
