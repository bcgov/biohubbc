import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { COLLECTION_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICollectionMember, ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { TransitionGroup } from 'react-transition-group';

interface IMembersCollectionFormProps {
  roles: ICodeWithDescription[];
}

export const CollectionMembersFormInitialValues = {
  members: []
};

/**
 * Form for adding members to a collection
 *
 * @param {IMembersCollectionFormProps} props
 * @returns
 */
export const CollectionMembersForm = (props: IMembersCollectionFormProps): JSX.Element => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateCollectionRequest>();

  const handleAddUser = (user: ISystemUser) => {
    setFieldValue(`members[${values.members.length}]`, {
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
    setFieldValue(`members[${index}].collection_role_name`, role);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.members.filter((item) => item.system_user_id !== systemUserId);

    setFieldValue(`members`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    const newErrors = { ...errors };
    delete errors.members;

    setErrors(newErrors);
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors?.members) {
      if (Array.isArray(errors.members)) {
        title = 'Missing Roles';
        text = 'All team members must be assigned a role.';
      } else {
        if (values.members.length > 0) {
          title = 'A coordinator role is required';
        } else {
          title = 'Missing Team Member';
        }
        text = errors.members;
      }
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.members && Array.isArray(errors.members)) {
      const errorAtIndex = errors.members[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a role for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.members?.[index]?.collection_role_name || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        {errors?.['members'] && values.members.length > 0 && (
          <Box mt={3}>
            <AlertBar severity="error" variant="standard" title={alertBarText().title} text={alertBarText().text} />
          </Box>
        )}
        <Box>
          <SystemUserAutocompleteField
            formikFieldName="system_user_id"
            label="Member"
            placeholder="Search by user"
            helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
            selectedUsers={values.members.map((member) => member.system_user_id)}
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
              {values.members.map((user, index: number) => {
                const error = rowItemError(index);
                return (
                  <Collapse
                    key={
                      'survey_member_id' in user
                        ? `${user.survey_member_id}-${user.system_user_id}`
                        : user.system_user_id
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
      </Box>
    </form>
  );
};
