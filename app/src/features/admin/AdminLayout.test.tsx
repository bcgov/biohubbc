import { render } from '@testing-library/react';
import React from 'react';
import AdminLayout from './AdminLayout';

describe('AdminLayout', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <AdminLayout>
        <p>This is the admin layout test child component</p>
      </AdminLayout>
    );

    expect(getByText('This is the admin layout test child component')).toBeVisible();
  });
});
