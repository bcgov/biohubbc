import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest, IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { alphabetizeObjects } from 'utils/Utils';
import yup from 'utils/YupSchema';

export const SurveyUserJobYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      system_user_id: yup.string().required('Username is required'),
      survey_job_name: yup.string().required('Select a survey job for this team member')
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

  const searchUserDataLoader = useDataLoader(() => biohubApi.user.searchSystemUser(''));
  searchUserDataLoader.load();

  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<(ISystemUser | IGetSurveyParticipant)[]>(props.users);

  useEffect(() => {
    props.users.forEach((user, index) => {
      setFieldValue(`participants[${index}].system_user_id`, user.system_user_id);
      setFieldValue(`participants[${index}].display_name`, user.display_name);
      setFieldValue(`participants[${index}].email`, user.email);
      setFieldValue(`participants[${index}].agency`, user.agency);
      setFieldValue(`participants[${index}].identity_source`, user.identity_source);
      setFieldValue(`participants[${index}].system_user_id`, user.system_user_id);
      setFieldValue(`participants[${index}].survey_job_name`, (user as IGetSurveyParticipant).survey_job_name);
    });
  }, [props.users, setFieldValue]);

  const handleAddUser = (user: ISystemUser | IGetSurveyParticipant) => {
    selectedUsers.push(user);

    setFieldValue(`participants[${selectedUsers.length - 1}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
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
    if (errors?.participants && Array.isArray(errors.participants)) {
      title = 'Missing Jobs';
      text = 'All team members must be assigned a survey job.';
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
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

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.participants?.[index]?.survey_job_name || '';
  };

  if (!searchUserDataLoader.data || !searchUserDataLoader.hasLoaded) {
    // should probably replace this with a skeleton
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend">Add Participants</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '72ch'
          }}>
          Add particpants to this survey and assign each a role.
        </Typography>
      </Box>
      {errors?.['participants'] && selectedUsers.length > 0 && (
        <Box mt={3}>
          <AlertBar severity="error" variant="standard" title={alertBarText().title} text={alertBarText().text} />
        </Box>
      )}
      <Box mt={3}>
        <Autocomplete
          id={'autocomplete-user-role-search'}
          data-testid={'autocomplete-user-role-search'}
          filterSelectedOptions
          noOptionsText="No records found"
          options={alphabetizeObjects(searchUserDataLoader.data, 'display_name')}
          filterOptions={(options, state) => {
            const searchFilter = createFilterOptions<ISystemUser>({ ignoreCase: true });
            const unselectedOptions = options.filter(
              (item) => !selectedUsers.some((existing) => existing.system_user_id === item.system_user_id)
            );
            return searchFilter(unselectedOptions, state);
          }}
          getOptionLabel={(option) => option.display_name}
          inputValue={searchText}
          onInputChange={(_, value, reason) => {
            if (reason === 'reset') {
              setSearchText('');
            } else {
              setSearchText(value);
            }
          }}
          onChange={(_, option) => {
            if (option) {
              handleAddUser(option);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder={'Find people'}
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <Box mx={1} mt="6px">
                    <Icon path={mdiMagnify} size={1}></Icon>
                  </Box>
                )
              }}
            />
          )}
          renderOption={(renderProps, renderOption) => {
            return (
              <Box component="li" {...renderProps} key={renderOption.system_user_id}>
                <UserCard
                  name={renderOption.display_name}
                  email={renderOption.email}
                  agency={renderOption.agency}
                  type={renderOption.identity_source}
                />
              </Box>
            );
          }}
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
            {selectedUsers.map((user: ISystemUser | IGetSurveyParticipant, index: number) => {
              const error = rowItemError(index);
              return (
                <Collapse key={user.system_user_id}>
                  <UserRoleSelector
                    index={index}
                    user={user}
                    roles={props.jobs}
                    error={error}
                    selectedRole={getSelectedRole(index)}
                    handleAdd={handleAddUserRole}
                    handleRemove={handleRemoveUser}
                    key={user.system_user_id}
                    label={'Select a Job'}
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

export default SurveyUserForm;
