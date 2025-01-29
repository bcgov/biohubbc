import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { SyntheticEvent } from 'react';

export interface IAutocompleteFieldOption<OptionValueType extends string | number> {
  value: OptionValueType;
  label: string;
  description?: string | null;
}

export interface IAutocompleteField<
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType>
> {
  id: string;
  label: string;
  name: string;
  options: OptionType[];
  disabled?: boolean;
  loading?: boolean;
  sx?: TextFieldProps['sx']; //https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/271#issuecomment-1561891271
  required?: boolean;
  filterLimit?: number;
  showValue?: boolean;
  disableClearable?: boolean;
  optionFilter?: 'value' | 'label'; // used to filter existing/ set data for the AutocompleteField, defaults to value in getExistingValue function
  helpText?: string;
  getOptionDisabled?: (option: OptionType) => boolean;
  onChange?: (event: SyntheticEvent<Element, Event>, option: OptionType | null) => void;
  renderOption?: (params: React.HTMLAttributes<HTMLLIElement>, option: OptionType) => React.ReactNode;
  onInputChange?: (event: React.SyntheticEvent<Element, Event>, value: string, reason: string) => void;
}

// To be used when you want an autocomplete field with no freesolo allowed but only one option can be selected

const AutocompleteField = <
  OptionValueType extends string | number,
  OptionType extends IAutocompleteFieldOption<OptionValueType> = IAutocompleteFieldOption<OptionValueType>
>(
  props: IAutocompleteField<OptionValueType, OptionType>
) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<OptionType>();

  const getExistingValue = (existingValue: OptionValueType): OptionType => {
    const result = props.options.find((option) => existingValue === option[props.optionFilter ?? 'value']);
    if (!result) {
      return null as unknown as OptionType;
    }

    return result;
  };

  const handleGetOptionSelected = (option: OptionType, value: OptionType): boolean => {
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
      id={props.id}
      fullWidth
      data-testid={props.id}
      value={getExistingValue(get(values, props.name))}
      options={props.options}
      getOptionLabel={(option) => option.label}
      disableClearable={props.disableClearable}
      isOptionEqualToValue={handleGetOptionSelected}
      getOptionDisabled={props.getOptionDisabled}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      disabled={props?.disabled || false}
      sx={{ flex: '1 1 auto', ...props.sx }}
      loading={props.loading}
      onInputChange={(_event, _value, reason) => {
        if (reason === 'reset') {
          return;
        }

        if (reason === 'clear') {
          setFieldValue(props.name, null);
          return;
        }
      }}
      onChange={(event, option) => {
        if (props.onChange) {
          props.onChange(event, option);
          return;
        }

        if (option?.value) {
          setFieldValue(props.name, option?.value);
        }
      }}
      renderOption={(params, option) => {
        if (props.renderOption) {
          return props.renderOption(params, option);
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
            required={props.required}
            label={props.label}
            value={props.showValue ? getExistingValue(get(values, props.name)) : null}
            variant="outlined"
            fullWidth
            error={get(touched, props.name) && Boolean(get(errors, props.name))}
            helperText={get(touched, props.name) && get(errors, props.name)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {props.loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {props.helpText && <HelpButtonTooltip content={props.helpText} />}
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
