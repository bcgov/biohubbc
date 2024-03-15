import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import UserCard from 'components/user/UserCard';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { PROJECT_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest, IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { alphabetizeObjects } from 'utils/Utils';
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
    .min(1)
    .hasAtLeastOneValue(
      'A minimum of one team member must be assigned the coordinator role.',
      'project_role_names',
      PROJECT_ROLE.COORDINATOR
    )
});

interface IProjectUserFormProps {
  roles: ICode[];
}

export const ProjectUserRoleFormInitialValues = {
  participants: []
};

const ProjectUserForm = (props: IProjectUserFormProps) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateProjectRequest>();
  const biohubApi = useBiohubApi();

  const searchUserDataLoader = useDataLoader(() => biohubApi.user.searchSystemUser(''));
  searchUserDataLoader.load();

  const [searchText, setSearchText] = useState('');

  const handleAddUser = (user: ISystemUser | IGetProjectParticipant) => {
    setFieldValue(`participants[${values.participants.length}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      project_role_names: []
    });
    clearErrors();
  };

  const handleAddUserRole = (role: string, index: number) => {
    setFieldValue(`participants[${index}].project_role_names`, [role]);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.participants.filter(
      (item: ISystemUser | IGetProjectParticipant) => item.system_user_id !== systemUserId
    );

    setFieldValue(`participants`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    const newErrors = { ...errors };
    delete errors.participants;

    setErrors(newErrors);
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors?.participants) {
      if (Array.isArray(errors.participants)) {
        title = 'Missing Roles';
        text = 'All team members must be assigned a role.';
      } else {
        if (values.participants.length > 0) {
          title = 'A coordinator role is required';
        } else {
          title = 'Missing Team Member';
        }
        text = errors.participants;
      }
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
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

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.participants?.[index]?.project_role_names?.[0] || '';
  };

  if (!searchUserDataLoader.data || !searchUserDataLoader.hasLoaded) {
    // should probably replace this with a skeleton
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend">Manage Team Members</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '72ch'
          }}>
          A minimum of one team member must be assigned the coordinator role.
        </Typography>
        {errors?.['participants'] && !values.participants.length && (
          <Box mt={3}>
            <AlertBar
              severity="error"
              variant="standard"
              title={'No team members added'}
              text={'At least one team member needs to be added to this project.'}
            />
          </Box>
        )}
        {errors?.['participants'] && values.participants.length > 0 && (
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
            options={searchText.length > 2 ? alphabetizeObjects(searchUserDataLoader.data, 'display_name') : []}
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
                placeholder={'Find team members'}
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
                  key={renderOption.system_user_id}
                  {...renderProps}>
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
              {values.participants.map((user: ISystemUser | IGetProjectParticipant, index: number) => {
                const error = rowItemError(index);
                return (
                  <Collapse key={user.system_user_id}>
                    <UserRoleSelector
                      index={index}
                      user={user}
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

export default ProjectUserForm;
