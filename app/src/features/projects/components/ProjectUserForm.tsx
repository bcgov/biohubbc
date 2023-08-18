import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { ISearchUserResponse } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import yup from 'utils/YupSchema';

export const AddProjectUser = yup.object().shape({
  users: yup.array().of(
    yup.object().shape({
      user_id: yup.string().required('Username is required'),
      role_id: yup.string().required('Display Name is required')
    })
  )
});

interface IProjectUser {
  users: any[];
  roles: ICode[];
}

interface IUserCard {
  name: string;
  email: string;
  agency: string;
  type: string;
}

const UserCard: React.FC<IUserCard> = (props) => {
  return (
    <Box>
      <Typography variant="h5">{props.name}</Typography>
      <Box display={'flex'}>
        <Typography variant="subtitle2">{props.email}</Typography>
        <Typography sx={{ marginX: 1 }} variant="subtitle2">
          {props.agency}
        </Typography>
        <Typography variant="subtitle2">{props.type}</Typography>
      </Box>
    </Box>
  );
};

const ProjectUserForm: React.FC<IProjectUser> = (props) => {
  const { handleSubmit } = useFormikContext<ICreateProjectRequest>();
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

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = selectedUsers.filter((item: ISearchUserResponse) => item.system_user_id !== systemUserId);
    setSelectedUsers(filteredUsers);
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
        <Autocomplete
          clearOnBlur
          handleHomeEndKeys
          id=""
          options={searchUsers}
          getOptionLabel={(option) => option.display_name || ''}
          onInputChange={(_, value) => {
            handleSearch(value, selectedUsers);
          }}
          onChange={(_, option) => {
            if (option) {
              selectedUsers.push(option);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Find Team Members"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon />,
                endAdornment: (
                  <>
                    {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(renderProps, renderOption, { selected }) => {
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
      <Box mt={3}>
        <FieldArray
          name="projectUsers"
          render={(arrayHelpers: FieldArrayRenderProps) => (
            <Grid container direction={'row'} spacing={2}>
              {selectedUsers.map((systemUser: ISearchUserResponse) => (
                <Grid item key={systemUser.system_user_id} xs={12}>
                  <Grid item xs={6} md={8}>
                    <UserCard
                      name={systemUser.display_name}
                      email={systemUser.email}
                      agency={systemUser.agency}
                      type={systemUser.identity_source}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Select displayEmpty value={6}>
                      {props.roles.map((item) => (
                        <MenuItem key={item.id} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <Button onClick={() => handleRemoveUser(systemUser.system_user_id)}>
                      <CloseIcon />
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          )}
        />
      </Box>
    </form>
  );
};

export default ProjectUserForm;
