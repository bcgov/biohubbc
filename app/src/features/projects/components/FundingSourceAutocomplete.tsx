import { FundingSourceType } from 'features/projects/components/ProjectFundingItemForm';
import React, { ChangeEvent, useEffect, useState } from 'react';
import AutocompleteField from '../../../components/fields/AutocompleteField';

/**
 * Encapsulates an auto complete option with a funding source type.
 * Type is added because the `FundingSourceAutocomplete` component takes both
 * Agencies and First Nations groups as options and we need a way to differentiate them
 */
export interface IAutocompleteFieldOptionWithType<T extends string | number> {
  value: T;
  label: string;
  type: FundingSourceType;
}

export interface IFundingSourceAutocompleteProps<T extends string | number> {
  id: string;
  label: string;
  options: IAutocompleteFieldOptionWithType<T>[];
  required?: boolean;
  filterLimit?: number;
  initialValue?: IAutocompleteFieldOptionWithType<T>;
  onChange: (event: ChangeEvent<Record<string, unknown>>, option: IAutocompleteFieldOptionWithType<T> | null) => void;
}

const FundingSourceAutocomplete: React.FC<IFundingSourceAutocompleteProps<string | number>> = <
  T extends string | number
>(
  props: IFundingSourceAutocompleteProps<T>
) => {
  const [name, setName] = useState('');

  // find the correct 'name' (key) to pull label information out of options
  useEffect(() => {
    if (props.initialValue) {
      if (props.initialValue.type === FundingSourceType.FIRST_NATIONS) {
        setName('first_nations_name');
      } else {
        setName('agency_name');
      }
    }
  }, [props.initialValue]);

  return (
    <AutocompleteField
      id={props.id}
      label={props.label}
      name={name}
      options={props.options}
      required={props.required}
      filterLimit={props.filterLimit}
      optionFilter="label"
      onChange={(event, option: any) => {
        if (option?.type === FundingSourceType.FIRST_NATIONS) {
          setName('first_nations_name');
        } else {
          setName('agency_name');
        }
        props.onChange(event as unknown as ChangeEvent<Record<string, unknown>>, option);
      }}
    />
  );
};

export default FundingSourceAutocomplete;
