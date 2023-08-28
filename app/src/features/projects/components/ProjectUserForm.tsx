import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useEffect, useState } from 'react';
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

  const searchUserDataLoader = useDataLoader(() => biohubApi.user.searchSystemUser(''));
  searchUserDataLoader.load();

  const [selectedUsers, setSelectedUsers] = useState<(ISystemUser | IGetProjectParticipant)[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    props.users.forEach((user, index) => {
      setFieldValue(`participants[${index}].system_user_id`, user.system_user_id);
      setFieldValue(`participants[${index}].project_role_names`, (user as IGetProjectParticipant).project_role_names);
    });
    setSelectedUsers(props.users);
  }, []);

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

  const filterSearchOptions = (
    searchUsers: ISystemUser[],
    selectedUsers: (ISystemUser | IGetProjectParticipant)[]
  ): ISystemUser[] => {
    // filter out any selected users out
    const filtered = searchUsers.filter(
      (item) => !selectedUsers.some((existing) => existing.system_user_id === item.system_user_id)
    );
    // alphabetize array on display name
    return alphabetizeObjects(filtered, 'display_name');
  };

  const getSelectedRole = (index: number): string | undefined => {
    if (values.participants[index]) {
      // users should only ever have a single role on a project so index: 0 is a safe selection
      return values.participants[index].project_role_names[0] || '';
    }
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
        {errors && errors['participants'] && !selectedUsers.length && (
          <Box mt={3}>
            <AlertBar
              severity="error"
              variant="standard"
              title={'No team members added'}
              text={'At least one team member needs to be added to this project.'}
            />
          </Box>
        )}
        {errors && errors['participants'] && selectedUsers.length > 0 && (
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
            options={filterSearchOptions(searchUserDataLoader.data, selectedUsers)}
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
              setSearchText('');
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
                <Box component="li" {...renderProps}>
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
        {selectedUsers.length > 0 && (
          <Box mt={2}>
            <Box
              sx={{
                '& .userRoleItemContainer + .userRoleItemContainer': {
                  mt: 1
                }
              }}>
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
        )}
      </Box>
    </form>
  );
};

export default ProjectUserForm;
