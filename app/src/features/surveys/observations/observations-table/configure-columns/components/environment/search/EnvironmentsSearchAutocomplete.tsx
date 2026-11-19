import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition,
  EnvironmentType
} from 'interfaces/useReferenceApi.interface';
import { debounce } from 'lodash-es';
import { useMemo, useState } from 'react';

export interface IEnvironmentsSearchAutocompleteProps {
  /**
   * The selected Environments.
   *
   * @type {EnvironmentType}
   * @memberof IEnvironmentsSearchAutocompleteProps
   */
  selectedOptions: EnvironmentType;
  /**
   * An async function that returns an array of options, based on the provided input value.
   *
   * @memberof IEnvironmentsSearchAutocompleteProps
   */
  getOptions: (inputValue: string) => Promise<EnvironmentType>;
  /**
   * Callback fired on selecting options.
   *
   * Note: this is not fired until the user un-focuses the component.
   *
   * @memberof IEnvironmentsSearchAutocompleteProps
   */
  onAddEnvironmentColumn: (EnvironmentColumn: EnvironmentType) => void;
}

export const EnvironmentsSearchAutocomplete = ({
  selectedOptions,
  getOptions,
  onAddEnvironmentColumn
}: IEnvironmentsSearchAutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<
    (EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition)[]
  >([]);

  const handleSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        const response = await getOptions(value);
        const allOptions = [...response.qualitative_environments, ...response.quantitative_environments];
        setOptions(allOptions.sort((a, b) => a.name.localeCompare(b.name)));
      }, 500),
    [getOptions]
  );

  const filterOptions = (opts: typeof options) =>
    opts.filter((option) => {
      if ('environment_qualitative_id' in option) {
        return !selectedOptions.qualitative_environments.some(
          (item) => item.environment_qualitative_id === option.environment_qualitative_id
        );
      } else {
        return !selectedOptions.quantitative_environments.some(
          (item) => item.environment_quantitative_id === option.environment_quantitative_id
        );
      }
    });

  return (
    <Autocomplete
      id="environments-autocomplete"
      data-testid="environments-autocomplete"
      options={filterOptions(options)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) =>
        'environment_qualitative_id' in option
          ? option.environment_qualitative_id === (value as any).environment_qualitative_id
          : option.environment_quantitative_id === (value as any).environment_quantitative_id
      }
      inputValue={inputValue}
      disableClearable
      onInputChange={(_, value, reason) => {
        if (reason !== 'reset') {
          setInputValue(value);
          handleSearch(value);
        }
      }}
      onFocus={() => handleSearch('')}
      onChange={(_, value) => {
        if (!value) {
          return;
        }

        onAddEnvironmentColumn({
          qualitative_environments: 'environment_qualitative_id' in value ? [value] : [],
          quantitative_environments: 'environment_quantitative_id' in value ? [value] : []
        });

        setInputValue('');
        setOptions([]);
      }}
      renderOption={(renderProps, renderOption) => (
        <ListItem
          disablePadding
          divider
          sx={{
            py: '12px !important',
            px: 2
          }}
          {...renderProps}
          key={`environment-item-${
            'environment_qualitative_id' in renderOption
              ? renderOption.environment_qualitative_id
              : renderOption.environment_quantitative_id
          }`}
          data-testid="environments-autocomplete-option">
          <Box>
            <Typography fontWeight={700}>{renderOption.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              {renderOption.description}
            </Typography>
          </Box>
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Enter environmental variables name"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1} />
              </Box>
            )
          }}
        />
      )}
    />
  );
};
