import { Box, Typography } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import SearchAutocompleteField from 'components/fields/SearchAutocompleteField';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import yup from 'utils/YupSchema';

export const SurveyUserJobYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      system_user_id: yup.string().required('Username is required'),
      job: yup.string().required('Select a job for this team member')
    })
  )
});

interface ISurveyUser {
  users: any[];
  jobs: ICode[];
}

export const SurveyUserJobFormInitialValues = {
  participants: []
};

const SurveyUserForm: React.FC<ISurveyUser> = (props) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();
  const biohubApi = useBiohubApi();

  const [searchUsers, setSearchUsers] = useState<ISystemUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ISystemUser[]>([]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, existingValues: ISystemUser[]) => {
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

  const handleAddUser = (user: ISystemUser) => {
    selectedUsers.push(user);

    setFieldValue(`participants[${selectedUsers.length - 1}]`, {
      system_user_id: user.system_user_id,
      job: ''
    });
    clearErrors();
  };

  const handleAddUserRole = (systemUserId: number, job: string, index: number) => {
    setFieldValue(`participants[${index}]`, {
      system_user_id: systemUserId,
      job: job
    });
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = selectedUsers.filter((item: ISystemUser) => item.system_user_id !== systemUserId);
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
        text = 'All team members must be assigned a job.';
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
            {errorAtIndex ? 'Select a job for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string | undefined => {
    return values.participants[index].job;
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
        <SearchAutocompleteField<ISystemUser>
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
          {selectedUsers.map((systemUser: ISystemUser, index: number) => {
            const error = rowItemError(index);
            return (
              <UserRoleSelector
                index={index}
                systemUser={systemUser}
                roles={props.jobs}
                error={error}
                selectedRole={getSelectedRole(index)}
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

export default SurveyUserForm;
