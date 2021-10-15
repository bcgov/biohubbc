import { render } from '@testing-library/react';
import React from 'react';
import ResourcesLayout from './ResourcesLayout';

describe('ResourcesLayout', () => {
  it('matches the snapshot', () => {
    const { getByText } = render(
      <ResourcesLayout>
        <p>This is the resources layout test child component</p>
      </ResourcesLayout>
    );

    expect(getByText('This is the resources layout test child component')).toBeVisible();
  });
});
