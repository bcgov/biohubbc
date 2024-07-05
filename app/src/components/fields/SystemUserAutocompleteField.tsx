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
import { debounce, startCase } from 'lodash-es';
import { useMemo, useState } from 'react';

interface ISystemUserAutocompleteFieldProps {
  /**
   * Formik field name.
   *
   * @type {string}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  formikFieldName: string;
  /**
   * The field label.
   *
   * @type {string}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  label: string;
  /**
   * Callback fired on option selection.
   *
   * @type {(species: ITaxonomy) => void}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  onSelect: (user?: ISystemUser) => void;
  /**
   * Optional callback fired on option de-selected/cleared.
   *
   * @memberof ISystemUserAutocompleteFieldProps
   */
  onClear?: () => void;
  /**
   * If field is required.
   *
   * @type {boolean}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  required?: boolean;
  /**
   * If field is disabled.
   *
   * @type {boolean}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  disabled?: boolean;
  /**
   * If `true`, clears the input field after a selection is made.
   *
   * @type {boolean}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  clearOnSelect?: boolean;
  /**
   * Whether to show start adornment magnifying glass or not
   * Defaults to false
   *
   * @type {boolean}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  showStartAdornment?: boolean;
  /**
   * Placeholder text for the TextField
   *
   * @type {string}
   * @memberof ISystemUserAutocompleteFieldProps
   */
  placeholder?: string;
}

/**
 * Autocomplete field for searching for and selecting a single system user.
 *
 * @param {ISystemUserAutocompleteFieldProps} props
 * @return {*}
 */
export const SystemUserAutocompleteField = (props: ISystemUserAutocompleteFieldProps) => {
  const { formikFieldName, disabled, label, showStartAdornment, placeholder, onSelect, onClear, clearOnSelect } = props;

  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  // The input field value
  const [inputValue, setInputValue] = useState('');
  // The array of options to choose from
  const [options, setOptions] = useState<ISystemUser[]>([]);
  // Is control loading (search in progress)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = useMemo(
    () =>
      debounce(async (keyword: string, callback: (searchedValues: ISystemUser[]) => void) => {
        const response = await biohubApi.user.searchSystemUser(keyword).catch(() => {
          return [];
        });

        callback(response);
      }, 500),
    [biohubApi.user]
  );

  return (
    <Autocomplete
      id={formikFieldName}
      disabled={disabled}
      data-testid={formikFieldName}
      filterSelectedOptions
      noOptionsText={inputValue.length > 2 ? 'No matching options' : 'Enter at least 3 letters'}
      options={options}
      getOptionLabel={(option) => option.display_name}
      isOptionEqualToValue={(option, value) => {
        return option.system_user_id === value.system_user_id;
      }}
      filterOptions={(item) => item}
      inputValue={inputValue}
      // Text field value changed
      onInputChange={(_, value, reason) => {
        if (clearOnSelect && reason === 'reset') {
          setInputValue('');
          setOptions([]);
          onClear?.();
          return;
        }

        if (reason === 'clear') {
          setInputValue('');
          setOptions([]);
          onClear?.();
          return;
        }

        if (!value) {
          setInputValue('');
          setOptions([]);
          return;
        }

        setIsLoading(true);
        setInputValue(value);
        handleSearch(value, (newOptions) => {
          if (value.length < 3) {
            return;
          }
          if (!isMounted()) {
            return;
          }
          setOptions(() => newOptions);
          setIsLoading(false);
        });
      }}
      // Option selected from dropdown
      onChange={(_, option) => {
        if (!option) {
          onClear?.();
          return;
        }

        onSelect(option);

        if (clearOnSelect) {
          setInputValue('');
          return;
        }

        setInputValue(startCase(option.display_name));
      }}
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
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={placeholder || 'Search by user'}
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
    />
  );
};
