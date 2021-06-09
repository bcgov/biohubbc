import { render } from '@testing-library/react';
import React from 'react';
import SearchLayout from './SearchLayout';

describe('SearchLayout', () => {
  it('matches the snapshot', () => {
    const { getByText } = render(
      <SearchLayout>
        <p>This is the search layout test child component</p>
      </SearchLayout>
    );

    expect(getByText('This is the search layout test child component')).toBeVisible();
  });
});
