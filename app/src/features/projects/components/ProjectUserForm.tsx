import { Box, Typography } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import SearchAutocompleteField from 'components/fields/SearchAutocompleteField';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { PROJECT_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { ISearchUserResponse } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';

export const ProjectUserRoleYupSchema = yup.object().shape({
  participants: yup
    .array()
    .of(
      yup.object().shape({
        system_user_id: yup.string().required('Username is required'),
        role: yup.string().required('Select a role for this team member')
      })
    )
    .min(1, 'At least 1 member needs to be added to manage a project.')
    .hasAtLeastOneValue(
      'A minimum of one team member must be assigned the coordinator role.',
      'role',
      PROJECT_ROLE.COORDINATOR
    )
});

interface IProjectUser {
  users: any[];
  roles: ICode[];
}

export const ProjectUserRoleFormInitialValues = {
  participants: []
};

const ProjectUserForm: React.FC<IProjectUser> = (props) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateProjectRequest>();
  const biohubApi = useBiohubApi();

  const [searchUsers, setSearchUsers] = useState<ISearchUserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ISearchUserResponse[]>([]);

  useEffect(() => {
    // currently logged in user is assumed to be the 'creator'
    // this will need to move out specifically to the create project step because it will be assumed they are a coordinator on the project
  }, []);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, existingValues: ISearchUserResponse[]) => {
        setIsSearching(true);
        const response = await biohubApi.user.searchSystemUser(inputValue.toLowerCase());

        // filter out any selected values from dropdown
        const filteredList = response.filter(
          (item) => !existingValues.some((existing) => existing.system_user_id === item.system_user_id)
        );
        setIsSearching(false);
        setSearchUsers(filteredList);
      }, 500),
    [biohubApi.user]
  );

  const handleAddUser = (user: ISearchUserResponse) => {
    selectedUsers.push(user);

    setFieldValue(`participants[${selectedUsers.length - 1}]`, {
      system_user_id: user.system_user_id,
      role: ''
    });
    clearErrors();
  };

  const handleAddUserRole = (systemUserId: number, role: string, index: number) => {
    setFieldValue(`participants[${index}]`, {
      system_user_id: systemUserId,
      role: role
    });
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = selectedUsers.filter((item: ISearchUserResponse) => item.system_user_id !== systemUserId);
    const filteredValues = values.participants.filter((item) => item.system_user_id !== systemUserId);

    setSelectedUsers(filteredUsers);
    setFieldValue(`participants`, filteredValues);
    clearErrors();
  };

  const clearErrors = () => {
    const tempErrors = errors;
    tempErrors.participants = undefined;
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

      return (
        <Typography style={{ fontSize: '12px', color: '#f44336' }}>
          {errorAtIndex ? 'Select a role for this team member.' : ''}
        </Typography>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend" variant="h5">
          Add Team Members
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat.
          Donec placerat nisl magna, et faucibus arcu condimentum sed.
        </Typography>
      </Box>
      <Box mt={3}>
        <SearchAutocompleteField<ISearchUserResponse>
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
      <Box mt={3}>
        {selectedUsers.length > 0 && (
          <Typography component={'legend'} variant="h5">
            Team Members ({selectedUsers.length})
          </Typography>
        )}
        {errors && errors['participants'] && (
          <AlertBar severity="error" variant="standard" title={alertBarText().title} text={alertBarText().text} />
        )}
        <Box>
          {selectedUsers.map((systemUser: ISearchUserResponse, index: number) => {
            const error = rowItemError(index);
            return (
              <UserRoleSelector
                index={index}
                systemUser={systemUser}
                roles={props.roles}
                error={error}
                handleAdd={handleAddUserRole}
                handleRemove={handleRemoveUser}
              />
            );
          })}
        </Box>
      </Box>
    </form>
  );
};

export default ProjectUserForm;
