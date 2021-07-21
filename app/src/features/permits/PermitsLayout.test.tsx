import { render } from '@testing-library/react';
import React from 'react';
import PermitsLayout from './PermitsLayout';

describe('PermitsLayout', () => {
  it('matches the snapshot', () => {
    const { getByText } = render(
      <PermitsLayout>
        <p>This is the permits layout test child component</p>
      </PermitsLayout>
    );

    expect(getByText('This is the permits layout test child component')).toBeVisible();
  });
});
