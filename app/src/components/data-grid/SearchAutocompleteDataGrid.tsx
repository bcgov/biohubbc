import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  createFilterOptions
} from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { DebouncedFunc } from 'lodash-es';
import { useEffect, useState } from 'react';

export interface IAutocompleteFieldOption {
  value: string | number;
  label: string;
}

export interface IAutocompleteField<T extends GridValidRowModel> {
  dataGridProps: GridRenderCellParams<T>;
  get: (value: string | number) => Promise<IAutocompleteFieldOption | null>;
  search: DebouncedFunc<
    (inputValue: string, callback: (searchResults: IAutocompleteFieldOption[]) => void) => Promise<void>
  >;
  onChange: (
    _event: React.ChangeEvent<any>,
    selectedOption: IAutocompleteFieldOption | null,
    reason: AutocompleteChangeReason
  ) => void;
}

const SearchAutocompleteDataGrid = <T extends GridValidRowModel>(props: IAutocompleteField<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<IAutocompleteFieldOption[]>([]);
  //   const [selectedOption, setSelectedOption] = useState<IAutocompleteFieldOption | null>(null);

  const currentValue = props.dataGridProps.value;

  console.log(currentValue);

  const loadOptionsForCurrentValue = async () => {
    const response = await props.get(currentValue);

    console.log('loadOptionsForCurrentValue', response);

    if (!response) {
      return;
    }

    setOptions([response]);
  };

  const searchAndUpdateOptions = async () => {
    if (!inputValue) {
      loadOptionsForCurrentValue();
      props.search.cancel();
    } else {
      props.search(inputValue, (searchResults) => {
        setOptions([...searchResults]);
      });
    }
  };

  useEffect(() => {
    loadOptionsForCurrentValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  useEffect(() => {
    searchAndUpdateOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  //   const defaultHandleOnChange = (_event: React.ChangeEvent<any>, selectedOption: IAutocompleteFieldOption[]) => {
  //     setOptions(sortAutocompleteOptions(selectedOption, options));
  //     setSelectedOption(selectedOption);
  //     // setFieldValue(
  //     //   props.id,
  //     //   selectedOption.map((item) => item.value)
  //     // );
  //   };

  const handleGetOptionSelected = (option: IAutocompleteFieldOption, value: IAutocompleteFieldOption): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  const handleOnInputChange = (event: React.ChangeEvent<any>, value: string, reason: AutocompleteInputChangeReason) => {
    if (event && event.type === 'blur') {
      setInputValue('');
    } else if (reason !== 'reset') {
      setInputValue(value);
    }
  };

  const getExistingValue = (existingValue?: number | string): IAutocompleteFieldOption | null => {
    console.log('getExistingValue', options);
    if (existingValue) {
      return options.find((option) => existingValue === option.value) || null;
    }

    return null;
  };

  return (
    <Autocomplete
      noOptionsText="No matching options"
      autoHighlight={true}
      fullWidth
      value={getExistingValue(currentValue)}
      id={String(props.dataGridProps.id)}
      data-testid={props.dataGridProps.id}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={handleGetOptionSelected}
      disableCloseOnSelect
      disableListWrap
      inputValue={inputValue}
      onInputChange={handleOnInputChange}
      onChange={props.onChange}
      filterOptions={createFilterOptions({ limit: 50 })}
      //   renderOption={(renderProps, renderOption, { selected }) => {
      //     return (
      //       <Box component="li" {...renderProps}>
      //         <Checkbox
      //           icon={<CheckBoxOutlineBlank fontSize="small" />}
      //           checkedIcon={<CheckBox fontSize="small" />}
      //           checked={selected}
      //           disabled={props.options.includes(renderOption) || false}
      //           value={renderOption.value}
      //           color="default"
      //         />
      //         {renderOption.label}
      //       </Box>
      //     );
      //   }}
      renderInput={(params) => (
        <TextField
          onKeyDown={(event: any) => {
            if (event.key === 'Backspace') {
              event.stopPropagation();
            }
          }}
          {...params}
          variant="outlined"
          fullWidth
          placeholder="Type to start searching"
        />
      )}
    />
  );
};

export default SearchAutocompleteDataGrid;
