import { Box, Typography } from '@mui/material';
import AlertBar from 'components/alert/AlertBar';
import SearchAutocompleteField from 'components/fields/SearchAutocompleteField';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest, IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';

export const SurveyUserJobYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      system_user_id: yup.string().required('Username is required'),
      survey_job_name: yup.string().required('Select a survey_job_name for this team member')
    })
  )
});

interface ISurveyUser {
  users: (ISystemUser | IGetSurveyParticipant)[];
  jobs: ICode[];
}

export const SurveyUserJobFormInitialValues = {
  participants: []
};

const SurveyUserForm: React.FC<ISurveyUser> = (props) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();
  const biohubApi = useBiohubApi();

  const [searchUsers, setSearchUsers] = useState<(ISystemUser | IGetSurveyParticipant)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<(ISystemUser | IGetSurveyParticipant)[]>([]);

  useEffect(() => {
    if (props.users.length > 0) {
      props.users.forEach((user, index) => {
        selectedUsers.push(user);
        setFieldValue(`participants[${index}].survey_job_name`, (user as IGetSurveyParticipant).survey_job_name);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleAddUser = (user: ISystemUser | IGetSurveyParticipant) => {
    selectedUsers.push(user);

    setFieldValue(`participants[${selectedUsers.length - 1}]`, {
      system_user_id: user.system_user_id,
      survey_job_name: ''
    });
    clearErrors();
  };

  const handleAddUserRole = (survey_job_name: string, index: number) => {
    setFieldValue(`participants[${index}].survey_job_name`, survey_job_name);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = selectedUsers.filter(
      (item: ISystemUser | IGetSurveyParticipant) => item.system_user_id !== systemUserId
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
    if (errors && errors.participants && Array.isArray(errors.participants)) {
      title = 'Missing Jobs';
      text = 'All team members must be assigned a survey_job_name.';
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors && errors.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a survey job for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string | undefined => {
    return values.participants[index] && values.participants[index].survey_job_name;
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
        <SearchAutocompleteField<ISystemUser | IGetSurveyParticipant>
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
          {selectedUsers.map((user: ISystemUser | IGetSurveyParticipant, index: number) => {
            const error = rowItemError(index);

            return (
              <UserRoleSelector
                index={index}
                user={user}
                roles={props.jobs}
                error={error}
                selectedRole={getSelectedRole(index)}
                handleAdd={handleAddUserRole}
                handleRemove={handleRemoveUser}
                key={`${user.system_user_id}-${user.email}`}
              />
            );
          })}
        </Box>
      </Box>
    </form>
  );
};

export default SurveyUserForm;
