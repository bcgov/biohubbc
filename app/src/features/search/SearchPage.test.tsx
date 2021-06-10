import { render } from '@testing-library/react';
import React from 'react';
import SearchPage from './SearchPage';

describe('SearchPage', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<SearchPage />);

    expect(asFragment()).toMatchSnapshot();
  });
});
