import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HelpButtonTooltip from 'components/tooltip/HelpButtonTooltip';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { SyntheticEvent, useMemo } from 'react';

export interface IAutocompleteFieldOption<OptionValueType extends string | number> {
  value: OptionValueType;
  label: string;
  description?: string | null;
}

interface IAutocompleteField<
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType>
> {
  /**
   * The id of the field.
   */
  id: string;
  /**
   * The label of the field. This is displayed in the UI.
   */
  label: string;
  /**
   * The name of the field. This is used to link the field to the formik state.
   */
  name: string;
  /**
   * An array of autocomplete options.
   */
  options: OptionType[];
  /**
   * An array of autocomplete option values.
   *
   * Options with these values will not be displayed in the autocomplete.
   */
  selectedOptions?: OptionValueType[];
  /**
   * If `true`, the field will be disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the field will be in a loading state.
   */
  loading?: boolean;
  /**
   * Additional styles to apply to the field.
   */
  sx?: TextFieldProps['sx']; //https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/271#issuecomment-1561891271
  /**
   * If `true`, the field will be marked required.
   */
  required?: boolean;
  /**
   * The maximum number of options to display in the autocomplete.
   */
  filterLimit?: number;
  /**
   * If `true`, the value will be displayed in the field.
   */
  showValue?: boolean;
  /**
   * If `true`, the clear button will be disabled.
   */
  disableClearable?: boolean;
  /**
   * The help text to display.
   */
  helpText?: string;
  /**
   * Function that receives an option, and returns a boolean indicating if that option should be disabled or not.
   */
  getOptionDisabled?: (option: OptionType) => boolean;
  /**
   * Callback fired when the autocomplete onChange event is triggered.
   */
  onChange?: (event: SyntheticEvent<Element, Event>, option: OptionType | null) => void;
  /**
   * Function that returns a custom render component for the option.
   */
  renderOption?: (params: React.HTMLAttributes<HTMLLIElement>, option: OptionType) => React.ReactNode;
  /**
   * Callback fired when the autcomplete input value changes.
   */
  onInputChange?: (event: React.SyntheticEvent<Element, Event>, value: string, reason: string) => void;
}

// To be used when you want an autocomplete field with no freesolo allowed but only one option can be selected

const AutocompleteField = <
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType> = IAutocompleteFieldOption<OptionValueType>
>(
  props: IAutocompleteField<OptionValueType, OptionType>
) => {
  const {
    id,
    label,
    name,
    options,
    selectedOptions,
    disabled,
    loading,
    sx,
    required,
    filterLimit,
    showValue,
    disableClearable,
    helpText,
    getOptionDisabled,
    onChange,
    renderOption
  } = props;

  const { touched, errors, setFieldValue, values } = useFormikContext<OptionType>();

  const getExistingValue = (existingValue: OptionValueType): OptionType => {
    const result = options.find((option) => existingValue === option.value);
    if (!result) {
      return null as unknown as OptionType;
    }

    return result;
  };

  // If selected options is provided, filter out selected options from the available options
  const filteredOptions = useMemo(
    () =>
      selectedOptions
        ? options.filter((option) =>
            // If the option is in the selected options, return false to filter it out
            selectedOptions.some((selectedOption) => selectedOption === option.value) ? false : true
          )
        : options,
    [options, selectedOptions]
  );

  const handleGetOptionSelected = (
    option: IAutocompleteFieldOption<OptionValueType>,
    value: IAutocompleteFieldOption<OptionValueType>
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <Autocomplete
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={id}
      fullWidth
      data-testid={id}
      value={getExistingValue(get(values, name))}
      options={filteredOptions}
      getOptionLabel={(option) => option.label}
      disableClearable={disableClearable}
      isOptionEqualToValue={handleGetOptionSelected}
      getOptionDisabled={getOptionDisabled}
      filterOptions={createFilterOptions({ limit: filterLimit })}
      disabled={disabled || false}
      sx={{ flex: '1 1 auto', ...sx }}
      loading={loading}
      onInputChange={(_event, _value, reason) => {
        if (reason === 'reset') {
          return;
        }

        if (reason === 'clear') {
          setFieldValue(name, null);
          return;
        }
      }}
      onChange={(event, option) => {
        if (onChange) {
          onChange(event, option);
          return;
        }

        if (option?.value) {
          setFieldValue(name, option?.value);
        }
      }}
      renderOption={(params, option) => {
        if (renderOption) {
          return renderOption(params, option);
        }

        return (
          <Box
            component="li"
            {...params}
            sx={{
              '& + li': {
                borderTop: '1px solid' + grey[300]
              }
            }}
            key={option.value}>
            <Box py={1}>
              <Typography fontWeight={700}>{option.label}</Typography>
              {option.description && (
                <Typography color="textSecondary" variant="body2">
                  {option.description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            required={required}
            label={label}
            value={showValue ? getExistingValue(get(values, name)) : null}
            variant="outlined"
            fullWidth
            error={get(touched, name) && Boolean(get(errors, name))}
            helperText={get(touched, name) && get(errors, name)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {helpText && <HelpButtonTooltip content={helpText} />}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        );
      }}
    />
  );
};

export default AutocompleteField;
