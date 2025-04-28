import { SURVEY_ROLE } from 'constants/roles';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import UserRoleSelector from './UserRoleSelector';

const mockRoles: ICodeWithDescription[] = [
  {
    id: 1,
    name: SURVEY_ROLE.ADMIN,
    description: 'The administrative lead of the project.'
  },
  {
    id: 2,
    name: SURVEY_ROLE.EDITOR,
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
          survey_role_names: [SURVEY_ROLE.ADMIN]
        }}
        roles={mockRoles}
        error={undefined}
        selectedRole={SURVEY_ROLE.ADMIN}
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
    const onDelete = vi.fn();
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
          survey_role_names: [SURVEY_ROLE.ADMIN]
        }}
        roles={mockRoles}
        error={undefined}
        selectedRole={SURVEY_ROLE.ADMIN}
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
    const onDelete = vi.fn();
    const onAdd = vi.fn();

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
          survey_role_names: []
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
