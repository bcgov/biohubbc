import { render } from '@testing-library/react';
import React from 'react';
import AdminUsersLayout from './AdminUsersLayout';

describe('AdminUsersLayout', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <AdminUsersLayout>
        <p>This is the admin users layout test child component</p>
      </AdminUsersLayout>
    );

    expect(getByText('This is the admin users layout test child component')).toBeVisible();
  });
});
