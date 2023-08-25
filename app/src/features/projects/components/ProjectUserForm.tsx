import { Box, Typography } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import SearchAutocompleteField from 'components/fields/SearchAutocompleteField';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { PROJECT_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest, IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';

export const ProjectUserRoleYupSchema = yup.object().shape({
  participants: yup
    .array()
    .of(
      yup.object().shape({
        system_user_id: yup.string().required('Username is required'),
        project_role_names: yup.array(yup.string()).min(1, 'Select a role for this team member')
      })
    )
    .min(1, 'At least 1 member needs to be added to manage a project.')
    .hasAtLeastOneValue(
      'A minimum of one team member must be assigned the coordinator role.',
      'project_role_names',
      PROJECT_ROLE.COORDINATOR
    )
});

interface IProjectUser {
  users: (ISystemUser | IGetProjectParticipant)[];
  roles: ICode[];
}

export const ProjectUserRoleFormInitialValues = {
  participants: []
};

const ProjectUserForm: React.FC<IProjectUser> = (props) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateProjectRequest>();
  const biohubApi = useBiohubApi();

  const [searchUsers, setSearchUsers] = useState<(ISystemUser | IGetProjectParticipant)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<(ISystemUser | IGetProjectParticipant)[]>([]);

  useEffect(() => {
    props.users.forEach((user, index) => {
      selectedUsers.push(user);
      setFieldValue(`participants[${index}].system_user_id`, user.system_user_id);
      setFieldValue(`participants[${index}].project_role_names`, (user as IGetProjectParticipant).project_role_names);
    });
  }, [props.users]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, existingValues: ISystemUser[]) => {
        if (!inputValue) {
          return;
        }

        setIsSearching(true);

        const response = await biohubApi.user.searchSystemUser(inputValue.toLowerCase()).catch(() => []);

        // filter out any selected values from dropdown
        const filteredList = response.filter(
          (item) => !existingValues.some((existing) => existing.system_user_id === item.system_user_id)
        );
        setIsSearching(false);
        setSearchUsers(filteredList);
      }, 500),
    [biohubApi.user]
  );

  const handleAddUser = (user: ISystemUser | IGetProjectParticipant) => {
    selectedUsers.push(user);

    setFieldValue(`participants[${selectedUsers.length - 1}]`, {
      system_user_id: user.system_user_id,
      project_role_names: []
    });
    clearErrors();
  };

  const handleAddUserRole = (role: string, index: number) => {
    setFieldValue(`participants[${index}].project_role_names`, [role]);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = selectedUsers.filter(
      (item: ISystemUser | IGetProjectParticipant) => item.system_user_id !== systemUserId
    );
    const filteredValues = values.participants.filter((item) => item.system_user_id !== systemUserId);

    setSelectedUsers(filteredUsers);
    setFieldValue(`participants`, filteredValues);
    clearErrors();
  };

  // Clear all errors for any modify action
  // setting to undefined keeps the formik form from submitting
  const clearErrors = () => {
    const tempErrors = errors;
    delete tempErrors.participants;
    setErrors(tempErrors);
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors && errors.participants) {
      if (Array.isArray(errors.participants)) {
        title = 'Missing Roles';
        text = 'All team members must be assigned a role.';
      } else {
        if (selectedUsers.length > 0) {
          title = 'Coordinator Role is Required';
        } else {
          title = 'Missing Team Member';
        }
        text = errors.participants;
      }
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors && errors.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a role for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string | undefined => {
    return values.participants[index].project_role_names[0] || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend">
          Add Team Members
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
          Select team members and assign each member a role for this project.
        </Typography>
        <Box mt={3}>
          <SearchAutocompleteField<ISystemUser | IGetProjectParticipant>
            id={''}
            displayNameKey={'display_name'}
            placeholderText={'Find Team Members'}
            searchOptions={searchUsers}
            selectedOptions={selectedUsers}
            handleSearch={handleSearch}
            isSearching={isSearching}
            handleOnChange={handleAddUser}
            renderSearch={(option) => (
              <UserCard
                name={option.display_name}
                email={option.email}
                agency={option.agency}
                type={option.identity_source}
              />
            )}
          />
        </Box>
      </Box>
      <Box component="fieldset" mt={4}>
        {selectedUsers.length > 0 && (
          <Typography component={'legend'} variant="h5">
            Assign Roles ({selectedUsers.length})
          </Typography>
        )}
        {errors && errors['participants'] && (
          <AlertBar severity="error" variant="standard" title={alertBarText().title} text={alertBarText().text} />
        )}
        <Box 
          sx={{
            '& .userRoleItemContainer + .userRoleItemContainer': {
              mt: 1
            }
          }}
        >
          {selectedUsers.map((user: ISystemUser | IGetProjectParticipant, index: number) => {
            const error = rowItemError(index);

            return (
              <UserRoleSelector
                index={index}
                user={user}
                roles={props.roles}
                error={error}
                selectedRole={getSelectedRole(index)}
                handleAdd={handleAddUserRole}
                handleRemove={handleRemoveUser}
                key={user.system_user_id}
              />
            );
          })}
        </Box>
      </Box>
    </form>
  );
};

export default ProjectUserForm;
