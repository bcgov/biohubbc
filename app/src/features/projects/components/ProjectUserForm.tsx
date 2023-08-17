import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { ISearchUserResponse } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
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
  // const [selectedUsers, setSelectedUsers] = useState<{ system_user_id: number; role_id: number }[]>([]);

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string, existingValues: number[]) => {
        setIsSearching(true);
        const response = await biohubApi.user.searchSystemUser(inputValue.toLowerCase());
        // const newOptions = convertOptions(response.searchResponse).filter(
        //   (item) => !existingValues?.includes(item.value)
        // );
        setIsSearching(false);
        setSearchUsers(response);
      }, 500),
    [biohubApi.user]
  );

  // const handleNewUser = () => {
  //   console.log('Add new user row');
  // };

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
          autoSelect
          clearOnBlur
          blurOnSelect
          handleHomeEndKeys
          id=""
          options={searchUsers}
          onInputChange={(event, value) => {
            handleSearch(value, []);
          }}
          onChange={(event, option) => {
            console.log('IS THIS THE SELECT OR THE SEARCH?');
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
      {/* <Box> Assign Role Errors</Box> */}
      <FieldArray name="" render={(arrayHelpers: FieldArrayRenderProps) => <Box></Box>} />
      <Box>
        {/* <FormControl required={true} error={false}>
          <InputLabel id="" required={false}>
            Project Role
          </InputLabel>
          <Select
            id={``}
            name={``}
            onChange={(event) => {
              console.log(`Selected: `, event?.target?.value);
            }}>
            {props.roles.map((item: ICode) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText></FormHelperText>
        </FormControl> */}
      </Box>
    </form>
  );
};

export default ProjectUserForm;
