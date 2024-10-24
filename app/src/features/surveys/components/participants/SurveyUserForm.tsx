import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
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

interface ISurveyUserFormProps {
  jobs: ICode[];
}

export const SurveyUserJobFormInitialValues = {
  participants: []
};

const SurveyUserForm = (props: ISurveyUserFormProps) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();
  const biohubApi = useBiohubApi();

  const searchUserDataLoader = useDataLoader((keyword: string) => biohubApi.user.searchSystemUser(keyword));

  const [searchText, setSearchText] = useState('');

  const [sortedUsers, setSortedUsers] = useState<ISystemUser[]>([]);

  useEffect(() => {
    if (searchUserDataLoader.data) {
      setSortedUsers(alphabetizeObjects(searchUserDataLoader.data, 'display_name'));
    }
  }, [searchUserDataLoader.data]);

  const handleAddUser = (user: ISystemUser | IGetSurveyParticipant) => {
    setFieldValue(`participants[${values.participants.length}]`, {
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
    const filteredUsers = values.participants.filter(
      (item: ISystemUser | IGetSurveyParticipant) => item.system_user_id !== systemUserId
    );

    setFieldValue(`participants`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    setErrors({ ...errors, participants: undefined });
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

  return (
    <form onSubmit={handleSubmit}>
      {errors?.['participants'] && values.participants.length > 0 && (
        <Box mt={3}>
          <AlertBar severity="error" variant="outlined" title={alertBarText().title} text={alertBarText().text} />
        </Box>
      )}
      <Box>
        <Autocomplete
          id={'autocomplete-user-role-search'}
          data-testid={'autocomplete-user-role-search'}
          filterSelectedOptions
          noOptionsText="No records found"
          options={sortedUsers}
          filterOptions={(options, state) => {
            const searchFilter = createFilterOptions<ISystemUser>({ ignoreCase: true });
            const unselectedOptions = options.filter(
              (item) => !values.participants.some((existing) => existing.system_user_id === item.system_user_id)
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

              if (value.length >= 3) {
                // Only search if the search text is at least 3 characters long
                searchUserDataLoader.refresh(value);
              }
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
              <Box
                component="li"
                sx={{
                  '& + li': {
                    borderTop: '1px solid' + grey[300]
                  }
                }}
                {...renderProps}
                key={renderOption.system_user_id}>
                <Box py={0.5} width="100%">
                  <UserCard
                    name={renderOption.display_name}
                    email={renderOption.email}
                    agency={renderOption.agency}
                    type={renderOption.identity_source}
                  />
                </Box>
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
            {values.participants.map((user: ISystemUser | IGetSurveyParticipant, index: number) => {
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
