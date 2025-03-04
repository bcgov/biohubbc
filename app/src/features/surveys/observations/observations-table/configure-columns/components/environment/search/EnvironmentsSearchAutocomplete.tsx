import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
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

/**
 * Renders a search input to find and add Environments.
 *
 * @param {IEnvironmentsSearchAutocompleteProps} props
 * @return {*}
 */
export const EnvironmentsSearchAutocomplete = (props: IEnvironmentsSearchAutocompleteProps) => {
  const { selectedOptions, getOptions, onAddEnvironmentColumn } = props;

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<
    (EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition)[]
  >([]);

  const handleSearch = useMemo(
    () =>
      debounce(
        async (
          inputValue: string,
          callback: (
            searchedValues: (EnvironmentQualitativeTypeDefinition | EnvironmentQuantitativeTypeDefinition)[]
          ) => void
        ) => {
          const response = await getOptions(inputValue);
          callback([...response.qualitative_environments, ...response.quantitative_environments]);
        },
        500
      ),
    [getOptions]
  );

  const loadAllOptions = async () => {
    const response = await getOptions('');
    const allOptions = [...response.qualitative_environments, ...response.quantitative_environments];

    const sortedOptions = allOptions.sort((a, b) => a.name.localeCompare(b.name));
    setOptions(sortedOptions);
  };

  // This function is a repeat of a function in another file for pluralising. It should be edited to an imported function. GridColumnDefinitionsUtils.tsx when PR goes through
  const getFormattedUnit = (unit: string) => {
    const unitSuffix = unit.endsWith('er') ? 's' : '';
    return `${unit}${unitSuffix}`;
  };

  return (
    <Autocomplete
      id="environments-autocomplete"
      data-testid="environments-autocomplete"
      noOptionsText="No matching options"
      autoHighlight={true}
      options={options}
      disableCloseOnSelect={true}
      blurOnSelect={true}
      clearOnBlur={true}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => {
        if ('environment_qualitative_id' in option && 'environment_qualitative_id' in value) {
          return option.environment_qualitative_id === value.environment_qualitative_id;
        } else if ('environment_quantitative_id' in option && 'environment_quantitative_id' in value) {
          return option.environment_quantitative_id === value.environment_quantitative_id;
        }

        return false;
      }}
      filterOptions={(options) => {
        if (!selectedOptions?.qualitative_environments.length && !selectedOptions?.quantitative_environments.length) {
          return options;
        }

        const unselectedOptions = options.filter((option) => {
          if ('environment_qualitative_id' in option) {
            return !selectedOptions.qualitative_environments.some(
              (item) => item.environment_qualitative_id === option.environment_qualitative_id
            );
          } else if ('environment_quantitative_id' in option) {
            return !selectedOptions.quantitative_environments.some(
              (item) => item.environment_quantitative_id === option.environment_quantitative_id
            );
          }

          return false;
        });

        return unselectedOptions;
      }}
      inputMode="search"
      inputValue={inputValue}
      onInputChange={(_, value, reason) => {
        if (reason === 'reset') {
          return;
        }

        if (reason === 'clear') {
          setInputValue('');
          return;
        }

        setInputValue(value);
        handleSearch(value, (newOptions) => {
          setOptions(() => newOptions);
        });
      }}
      onFocus={() => {
        loadAllOptions();
      }}
      value={null} // The selected value is not displayed in the input field or tracked by this component
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
      renderOption={(renderProps, renderOption) => {
        return (
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
            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={2}>
              <Box flex={1}>
                <Typography component="div" variant="body1" fontWeight={700}>
                  {renderOption.name}
                </Typography>
                <Typography
                  component="div"
                  variant="subtitle2"
                  color="textSecondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {renderOption.description}
                </Typography>
              </Box>
              {'environment_quantitative_id' in renderOption && renderOption.unit && (
                <Chip
                  label={getFormattedUnit(renderOption.unit)}
                  size="small"
                  sx={{
                    bgcolor: 'grey.200',
                    color: 'text.secondary',
                    height: '24px',
                    borderRadius: '12px',
                    fontWeight: 500
                    // This font is not bold enough, but 600 value jumps to super bold and I gave up. Doesn't look right imo
                  }}
                />
              )}
            </Stack>
          </ListItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name="environments-autocomplete-input"
          variant="outlined"
          fullWidth
          placeholder="Enter environment name"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box mx={1} mt="6px">
                <Icon path={mdiMagnify} size={1}></Icon>
              </Box>
            )
          }}
          data-testid="environments-autocomplete-input"
          aria-label="Find observation Environments"
        />
      )}
    />
  );
};
