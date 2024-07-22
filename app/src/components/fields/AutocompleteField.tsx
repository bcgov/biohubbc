import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import { SyntheticEvent } from 'react';

export interface IAutocompleteFieldOption<T extends string | number> {
  value: T;
  label: string;
  description?: string | null;
}

export interface IAutocompleteField<T extends string | number> {
  id: string;
  label: string;
  name: string;
  options: IAutocompleteFieldOption<T>[];
  disabled?: boolean;
  loading?: boolean;
  sx?: TextFieldProps['sx']; //https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/issues/271#issuecomment-1561891271
  required?: boolean;
  filterLimit?: number;
  showValue?: boolean;
  optionFilter?: 'value' | 'label'; // used to filter existing/ set data for the AutocompleteField, defaults to value in getExistingValue function
  getOptionDisabled?: (option: IAutocompleteFieldOption<T>) => boolean;
  onChange?: (event: SyntheticEvent<Element, Event>, option: IAutocompleteFieldOption<T> | null) => void;
  renderOption?: (params: React.HTMLAttributes<HTMLLIElement>, option: IAutocompleteFieldOption<T>) => React.ReactNode;
  onInputChange?: (event: React.SyntheticEvent<Element, Event>, value: string, reason: string) => void;
}

// To be used when you want an autocomplete field with no freesolo allowed but only one option can be selected

const AutocompleteField = <T extends string | number>(props: IAutocompleteField<T>) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<IAutocompleteFieldOption<T>>();

  const getExistingValue = (existingValue: T): IAutocompleteFieldOption<T> => {
    const result = props.options.find((option) => existingValue === option[props.optionFilter ?? 'value']);
    if (!result) {
      return null as unknown as IAutocompleteFieldOption<T>;
    }

    return result;
  };

  const handleGetOptionSelected = (
    option: IAutocompleteFieldOption<T>,
    value: IAutocompleteFieldOption<T>
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
      id={props.id}
      data-testid={props.id}
      value={getExistingValue(get(values, props.name))}
      options={props.options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      getOptionDisabled={props.getOptionDisabled}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      disabled={props?.disabled || false}
      sx={props.sx}
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
