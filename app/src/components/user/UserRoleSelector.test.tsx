import { PROJECT_ROLE } from 'constants/roles';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import UserRoleSelector from './UserRoleSelector';

const mockRoles: IGetAllCodeSetsResponse['project_roles'] = [
  {
    id: 1,
    name: PROJECT_ROLE.COORDINATOR,
    description: 'The administrative lead of the project.'
  },
  {
    id: 2,
    name: PROJECT_ROLE.COLLABORATOR,
    description: 'A participant team member of the project.'
  }
];

describe('UserRoleSelector', () => {
  it('renders correctly with default values', async () => {
    const { getByText } = render(
      <UserRoleSelector
        index={0}
        user={{
          system_user_id: 1,
          user_identifier: 'identifier',
          user_guid: '',
          identity_source: 'IDIR',
          record_end_date: '',
          role_ids: [],
          role_names: [],
          email: 'user@email.com',
          display_name: 'Test User',
          agency: 'Business',
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        }}
        roles={mockRoles}
        error={undefined}
        selectedRole={PROJECT_ROLE.COORDINATOR}
        handleAdd={() => {}}
        handleRemove={() => {}}
        key={1}
        label={'Select a Role'}
      />
    );

    await waitFor(async () => {
      expect(getByText('Test User', { exact: false })).toBeVisible();
    });
  });

  it('remove user function runs', async () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <UserRoleSelector
        index={0}
        user={{
          system_user_id: 1,
          user_identifier: 'identifier',
          user_guid: '',
          identity_source: 'IDIR',
          record_end_date: '',
          role_ids: [],
          role_names: [],
          email: 'user@email.com',
          display_name: 'Test User',
          agency: 'Business',
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        }}
        roles={mockRoles}
        error={undefined}
        selectedRole={PROJECT_ROLE.COORDINATOR}
        handleAdd={() => {}}
        handleRemove={onDelete}
        key={1}
        label={'Select a Role'}
      />
    );

    await waitFor(async () => {
      const button = getByTestId('remove-user-role-button-0');
      fireEvent.click(button);

      expect(onDelete).toHaveBeenCalled();
    });
  });

  it('Add role to user', async () => {
    const onDelete = jest.fn();
    const onAdd = jest.fn();

    const { getByTestId, getByText } = render(
      <UserRoleSelector
        index={0}
        user={{
          system_user_id: 1,
          user_identifier: 'identifier',
          user_guid: '',
          identity_source: 'IDIR',
          record_end_date: '',
          role_ids: [],
          role_names: [],
          email: 'user@email.com',
          display_name: 'Test User',
          agency: 'Business',
          project_role_names: []
        }}
        roles={mockRoles}
        error={undefined}
        selectedRole={''}
        handleAdd={onAdd}
        handleRemove={onDelete}
        key={1}
        label={'Select a Role'}
      />
    );

    await waitFor(async () => {
      const button = getByTestId('select-user-role-button-0');
      fireEvent.click(button);

      if (button.firstChild) {
        fireEvent.keyDown(button.firstChild, { key: 'ArrowDown' });
      }
    });

    await waitFor(async () => {
      expect(getByText('Collaborator', { exact: false })).toBeVisible();

      fireEvent.click(getByText('Collaborator', { exact: false }));

      expect(onAdd).toHaveBeenCalled();
    });
  });
});
