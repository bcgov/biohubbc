import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { FundingSourceType } from 'features/projects/components/ProjectFundingItemForm';
import { useFormikContext } from 'formik';
import get from 'lodash-es/get';
import React, { ChangeEvent, useEffect, useState } from 'react';

export interface IAutocompleteFieldOptionWithType<T extends string | number> {
  value: T;
  label: string;
  type: FundingSourceType;
}

export interface IAutocompleteField<T extends string | number> {
  id: string;
  label: string;
  options: IAutocompleteFieldOptionWithType<T>[];
  required?: boolean;
  filterLimit?: number;
  initialValue?: IAutocompleteFieldOptionWithType<T>;
  onChange?: (event: ChangeEvent<Record<string, unknown>>, option: IAutocompleteFieldOptionWithType<T> | null) => void;
}

const AutocompleteFieldWithType: React.FC<IAutocompleteField<string | number>> = <T extends string | number>(
  props: IAutocompleteField<T>
) => {
  const { touched, errors, setFieldValue, values } = useFormikContext<IAutocompleteFieldOptionWithType<T>>();
  const [name, setName] = useState('');

  useEffect(() => {
    if (props.initialValue) {
      if (props.initialValue.type === FundingSourceType.FIRST_NATIONS) {
        setName('first_nations_name');
      } else {
        setName('agency_name');
      }
    }
  }, [props.initialValue]);

  const getExistingValue = (existingValue: T): IAutocompleteFieldOptionWithType<T> => {
    const result = props.options.find((option) => existingValue === option.label);

    if (!result) {
      return (null as unknown) as IAutocompleteFieldOptionWithType<T>;
    }

    return result;
  };

  const handleGetOptionSelected = (
    option: IAutocompleteFieldOptionWithType<T>,
    value: IAutocompleteFieldOptionWithType<T>
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <Autocomplete
      autoSelect
      clearOnBlur
      blurOnSelect
      handleHomeEndKeys
      id={props.id}
      data-testid={props.id}
      value={getExistingValue(get(values, name))}
      options={props.options}
      getOptionLabel={(option) => option.label}
      getOptionSelected={handleGetOptionSelected}
      filterOptions={createFilterOptions({ limit: props.filterLimit })}
      onChange={(event, option) => {
        if (option?.type === FundingSourceType.FIRST_NATIONS) {
          setName('first_nations_name');
        } else {
          setName('agency_name');
        }

        if (props.onChange) {
          props.onChange(event, option);
          return;
        }

        setFieldValue(name, option?.value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={get(touched, name) && Boolean(get(errors, name))}
          helperText={get(touched, name) && get(errors, name)}
        />
      )}
    />
  );
};

export default AutocompleteFieldWithType;
