import { render } from '@testing-library/react';
import React from 'react';
import ResourcesPage from './ResourcesPage';

describe('ResourcesPage', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<ResourcesPage />);

    expect(getByTestId('resources-table')).toBeInTheDocument();
  });
});
