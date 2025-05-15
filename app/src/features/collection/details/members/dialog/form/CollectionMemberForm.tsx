import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { COLLECTION_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICollectionMember } from 'interfaces/useCollectionApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { TransitionGroup } from 'react-transition-group';

export interface ICollectionMemberData {
  participants: (ISystemUser & ICollectionMember)[];
}

interface ICollectionMemberForm {
  roles: ICodeWithDescription[];
}

/**
 * Form for adding participants to the collection
 *
 * @returns {*}
 */
const CollectionMemberForm = (props: ICollectionMemberForm) => {
  const { values, setFieldValue, errors, setErrors } = useFormikContext<ICollectionMemberData>();

  const clearErrors = () => {
    const newErrors = { ...errors };
    delete errors.participants;

    setErrors(newErrors);
  };

  const handleAddUser = (user: ISystemUser) => {
    setFieldValue(`participants[${values.participants.length}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      collection_role_name: COLLECTION_ROLE.MEMBER
    });
    clearErrors();
  };

  const handleAddUserRole = (role: string, index: number) => {
    setFieldValue(`participants[${index}].collection_role_name`, role);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.participants.filter((item) => item.system_user_id !== systemUserId);

    setFieldValue(`participants`, filteredUsers);
    clearErrors();
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a role for this member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.participants?.[index]?.collection_role_name || '';
  };

  return (
    <form>
      <Box mt={3}>
        <SystemUserAutocompleteField
          formikFieldName="system_user_id"
          label="Team Member"
          placeholder="Search by user"
          helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
          selectedUsers={values.participants.map((participant) => participant.system_user_id)}
          clearOnSelect
          onSelect={(value) => {
            if (value) {
              handleAddUser(value);
            }
          }}
          key="project-user-filter"
        />
      </Box>
      <Box>
        <Box
          sx={{
            '& .userRoleItemContainer + .userRoleItemContainer': {
              mt: 1
            }
          }}>
          <TransitionGroup>
            {values.participants.map((user, index: number) => {
              const error = rowItemError(index);
              return (
                <Collapse
                  key={
                    'survey_member_id' in user ? `${user.survey_member_id}-${user.system_user_id}` : user.system_user_id
                  }>
                  <UserRoleSelector
                    index={index}
                    user={user as ICollectionMember}
                    roles={props.roles}
                    error={error}
                    selectedRole={getSelectedRole(index)}
                    handleAdd={handleAddUserRole}
                    handleRemove={handleRemoveUser}
                    key={user.system_user_id}
                    label={'Select a Role'}
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
      </Box>
    </form>
  );
};

export default CollectionMemberForm;
