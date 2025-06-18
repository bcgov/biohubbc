import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteProps,
  createFilterOptions
} from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HelpButtonTooltip from 'components/tooltip/HelpButtonTooltip';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { SyntheticEvent, useMemo } from 'react';

export interface IFreeSoloAutocompleteFieldOption<OptionValueType extends string | number> {
  value: OptionValueType;
  label: string;
  description?: string | null;
}

export interface IFreeSoloAutocompleteFieldProps<
  OptionValueType extends string | number,
  OptionType extends IFreeSoloAutocompleteFieldOption<OptionValueType>
> extends Omit<
    AutocompleteProps<string | OptionType, false, true, true>,
    | 'renderInput'
    | 'options'
    | 'onChange'
    | 'onInputChange'
    | 'renderOption'
    | 'getOptionDisabled'
    | 'getOptionLabel'
    | 'isOptionEqualToValue'
  > {
  /**
   * The field name used by Formik.
   */
  name: string;

  /**
   * The id of the field.
   */
  id: string;

  /**
   * Label for the text input.
   */
  label: string;

  /**
   * The list of options shown in the dropdown.
   */
  options: OptionType[];

  /**
   * Values to exclude from the dropdown.
   */
  selectedOptions?: OptionValueType[];

  /**
   * Whether a value is required
   */
  required?: boolean;

  /**
   * Optional icon displayed at the start of the input field.
   */
  startIcon?: React.ReactNode;

  /**
   * Optional icon displayed at the end of the input field.
   */
  endIcon?: React.ReactNode;

  /**
   * Show value label instead of raw value.
   */
  showValue?: boolean;

  /**
   * Max limit for filtered results.
   */
  filterLimit?: number;

  /**
   * Help text tooltip.
   */
  helpText?: string;

  /**
   * Custom input change handler.
   */
  onInputChange?: (event: SyntheticEvent, value: string, reason: string) => void;

  /**
   * Custom change handler - receives either an option object or string value.
   */
  onChange?: (
    event: SyntheticEvent,
    value: string | OptionType | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string | OptionType>
  ) => void;

  /**
   * Custom option renderer.
   */
  renderOption?: (params: React.HTMLAttributes<HTMLLIElement>, option: string | OptionType) => React.ReactNode;
}

export const FreeSoloAutocompleteField = <
  OptionValueType extends string | number,
  OptionType extends
    IFreeSoloAutocompleteFieldOption<OptionValueType> = IFreeSoloAutocompleteFieldOption<OptionValueType>
>(
  props: IFreeSoloAutocompleteFieldProps<OptionValueType, OptionType>
) => {
  const {
    id,
    label,
    name,
    options,
    selectedOptions,
    disabled,
    loading,
    startIcon,
    endIcon,
    required,
    filterLimit,
    helpText,
    onInputChange,
    onChange,
    renderOption,
    ...rest
  } = props;

  const { touched, errors, setFieldValue, values } = useFormikContext();

  const rawValue = get(values, name);

  const getExistingValue = (value: OptionValueType | string): string | OptionType => {
    const found = options.find((option) => option.value === value);
    return found ? found : typeof value === 'string' ? value : '';
  };

  const filteredOptions = useMemo(() => {
    return selectedOptions ? options.filter((option) => !selectedOptions.includes(option.value)) : options;
  }, [options, selectedOptions]);

  const handleGetOptionSelected = (option: string | OptionType, value: string | OptionType): boolean => {
    if (typeof option === 'string' || typeof value === 'string') {
      return option === value;
    }
    return option.value === value.value;
  };

  const getOptionLabel = (option: string | OptionType): string => {
    if (typeof option === 'string') {
      return option;
    }
    return option.label;
  };

  return (
    <Autocomplete
      {...rest}
      id={id}
      fullWidth
      options={filteredOptions}
      freeSolo={true}
      disableClearable
      value={getExistingValue(rawValue)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: filterLimit })}
      disabled={disabled}
      loading={loading}
      onInputChange={(event, value, reason) => {
        if (reason === 'reset') {
          return;
        }
        if (reason === 'clear') {
          setFieldValue(name, '');
          return;
        }
        onInputChange?.(event, value, reason);
      }}
      onChange={(event, value, reason, details) => {
        // Handle the value based on its type
        const finalValue = typeof value === 'string' ? value : value?.value;
        setFieldValue(name, finalValue ?? '');

        // Call the custom onChange handler with the correct signature
        onChange?.(event, value, reason, details);
      }}
      renderOption={(params, option) =>
        renderOption ? (
          renderOption(params, option as OptionType)
        ) : typeof option === 'string' ? (
          <Box component="li" {...params}>
            {option}
          </Box>
        ) : (
          <Box component="li" {...params} sx={{ '& + li': { borderTop: `1px solid ${grey[300]}` } }} key={option.value}>
            <Box py={1}>
              <Typography fontWeight={700}>{option.label}</Typography>
              {option.description && (
                <Typography color="textSecondary" variant="body2">
                  {option.description}
                </Typography>
              )}
            </Box>
          </Box>
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label}
          variant="outlined"
          fullWidth
          error={Boolean(get(touched, name)) && Boolean(get(errors, name))}
          helperText={get(touched, name) && get(errors, name)}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {startIcon}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {helpText && <HelpButtonTooltip content={helpText} />}
                {params.InputProps.endAdornment}
                {endIcon}
              </>
            )
          }}
        />
      )}
    />
  );
};
