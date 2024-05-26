import { mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import UserCard from 'components/user/UserCard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { debounce } from 'lodash-es';
import { ChangeEvent, useMemo, useState } from 'react';

interface ISystemUserAutocompleteProps {
  formikFieldName: string;
  required: boolean;
  label: string;
  handleUser: (user?: ISystemUser) => void;
  handleClear: () => void;
  showStartAdornment?: boolean;
  showSelectedValue?: boolean;
}

const SystemUserAutocomplete = (props: ISystemUserAutocompleteProps) => {
  const { formikFieldName, label, showStartAdornment, showSelectedValue, handleUser, handleClear } = props;

  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  const [searchText, setSearchText] = useState('');
  const [sortedUsers, setSortedUsers] = useState<ISystemUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const search = useMemo(
    () =>
      debounce(async (keyword: string, callback: (searchedValues: ISystemUser[]) => void) => {
        setIsLoading(true);

        if (!isMounted) {
          return;
        }

        const response = await biohubApi.user.searchSystemUser(keyword);
        callback(response);
      }, 500),
    [biohubApi.user, isMounted]
  );

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setSearchText(input);

    if (!input) {
      setSortedUsers([]);
      search.cancel();
      handleUser();
      return;
    }
    setIsLoading(true);
    search(input, (userOptions) => {
      if (!isMounted()) {
        return;
      }
      setSortedUsers(userOptions);
      setIsLoading(false);
    });
  };

  return (
    <Autocomplete
      id={formikFieldName}
      data-testid={formikFieldName}
      filterSelectedOptions
      noOptionsText={'No matching people found'}
      options={sortedUsers}
      getOptionLabel={(option) => option.display_name}
      inputValue={searchText}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset' || reason === 'clear') {
          setSearchText('');
          handleClear();
        } else {
          setSearchText(value);
        }
      }}
      onChange={(_, option) => {
        if (option) {
          handleUser(option);
          setSearchText(showSelectedValue ? option.display_name : '');
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          onChange={handleOnChange}
          placeholder={'Find someone'}
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: showStartAdornment && (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(renderProps, renderOption) => (
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
      )}
    />
  );
};

export default SystemUserAutocomplete;
