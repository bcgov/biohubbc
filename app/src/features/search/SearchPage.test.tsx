import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router-dom';
import SearchPage from './SearchPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  search: {
    getSearchResults: jest.fn()
  }
};

((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(mockUseBiohubApi);

describe('SearchPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <Router history={history}>
        <SearchPage />
      </Router>
    );

    expect(getByText('Map')).toBeInTheDocument();
  });
});
