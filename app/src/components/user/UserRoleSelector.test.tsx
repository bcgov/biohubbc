import { PROJECT_ROLE } from 'constants/roles';
import { ICode } from 'interfaces/useCodesApi.interface';
import { act, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import UserRoleSelector from './UserRoleSelector';
const roles: ICode[] = [
  {
    id: 1,
    name: PROJECT_ROLE.COLLABORATOR
  },
  {
    id: 2,
    name: PROJECT_ROLE.COORDINATOR
  },
  {
    id: 3,
    name: PROJECT_ROLE.OBSERVER
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
        roles={roles}
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
        roles={roles}
        error={undefined}
        selectedRole={PROJECT_ROLE.COORDINATOR}
        handleAdd={() => {}}
        handleRemove={onDelete}
        key={1}
        label={'Select a Role'}
      />
    );

    await act(async () => {
      const button = getByTestId('remove-user-role-button-0');
      fireEvent.click(button);

      expect(onDelete).toBeCalled();
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
        roles={roles}
        error={undefined}
        selectedRole={''}
        handleAdd={onAdd}
        handleRemove={onDelete}
        key={1}
        label={'Select a Role'}
      />
    );

    await act(async () => {
      const button = getByTestId('select-user-role-button-0');
      fireEvent.click(button);

      if (button.firstChild) {
        fireEvent.keyDown(button.firstChild, { key: 'ArrowDown' });
      }
    });

    await waitFor(async () => {
      expect(getByText('Collaborator', { exact: false })).toBeVisible();

      fireEvent.click(getByText('Collaborator', { exact: false }));

      expect(onAdd).toBeCalled();
    });
  });
});
