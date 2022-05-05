import Checkbox from '@material-ui/core/Checkbox';
import ListSubheader from '@material-ui/core/ListSubheader';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import CheckBox from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import { FilterOptionsState } from '@material-ui/lab';
import Autocomplete, { AutocompleteInputChangeReason, createFilterOptions } from '@material-ui/lab/Autocomplete';
import { useFormikContext } from 'formik';
import { DebouncedFunc } from 'lodash-es';
import get from 'lodash-es/get';
import React, { useEffect, useState } from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';

const LISTBOX_PADDING = 8; // px

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
}

// Params required to make MultiAutocompleteField use API to populate search results
export type ApiSearchTypeParam = {
  type: 'api-search';
  options?: null;
  getInitList: (initialValues: number[]) => Promise<IMultiAutocompleteFieldOption[]>;
  search: DebouncedFunc<
    (
      inputValue: string,
      existingValues: (string | number)[],
      callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
    ) => Promise<void>
  >;
};

// Params required to use normal MultiAutocompleteField with predefined options
export type defaultTypeParam = {
  type?: 'default';
  options: IMultiAutocompleteFieldOption[];
};

export type IMultiAutocompleteField = {
  id: string;
  label: string;
  required?: boolean;
  filterLimit?: number;
} & (ApiSearchTypeParam | defaultTypeParam);

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING
    }
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 54;

  const getChildSize = (child: React.ReactNode) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index: number) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}>
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const useStyles = makeStyles({
  listbox: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0
    }
  }
});

const MultiAutocompleteFieldVariableSize: React.FC<IMultiAutocompleteField> = (props) => {
  const classes = useStyles();

  const { values, touched, errors, setFieldValue } = useFormikContext<IMultiAutocompleteFieldOption>();

  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(props.options || []); // store options if provided

  // For api-search type, options are not provided by parent
  // These helpers will help manipulate options using API
  const apiSearchTypeHelpers =
    props.type === 'api-search'
      ? {
          async loadOptionsForSelectedValues() {
            const selectedValues = get(values, props.id);
            const response = await props.getInitList(selectedValues);
            setOptions(response);
          },
          async searchSpecies() {
            const existingValues = get(values, props.id);
            const selectedOptions = (existingValues?.length && options.slice(0, existingValues.length)) || [];

            if (!inputValue) {
              setOptions(selectedOptions);
              props.search.cancel();
            } else {
              props.search(inputValue, existingValues, (newOptions) => {
                if (selectedOptions.length || newOptions.length || options.length) {
                  setOptions([...selectedOptions, ...newOptions]);
                }
              });
            }
          }
        }
      : null;

  useEffect(() => {
    apiSearchTypeHelpers && apiSearchTypeHelpers.loadOptionsForSelectedValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiSearchTypeHelpers && apiSearchTypeHelpers.searchSpecies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const getExistingValue = (existingValues: (number | string)[]): IMultiAutocompleteFieldOption[] => {
    if (existingValues) {
      return options.filter((option) => existingValues.includes(option.value));
    }
    return [];
  };

  const handleGetOptionSelected = (
    option: IMultiAutocompleteFieldOption,
    value: IMultiAutocompleteFieldOption
  ): boolean => {
    return !option?.value || !value?.value ? false : option.value === value.value;
  };

  const handleOnInputChange = (event: React.ChangeEvent<any>, value: string, reason: AutocompleteInputChangeReason) => {
    if (event && event.type === 'blur') {
      setInputValue('');
    } else if (reason !== 'reset') {
      setInputValue(value);
    }
  };

  const handleOnChange = (_event: React.ChangeEvent<any>, selectedOptions: IMultiAutocompleteFieldOption[]) => {
    const selectedOptionsValue = selectedOptions.map((item) => item.value);
    const remainingOptions = options.filter((item) => !selectedOptionsValue.includes(item.value));

    // when type is api-search and no input, dont show any options
    // as options gets populated as searched by keyword.
    if (!inputValue && props.type === 'api-search') {
      setOptions(selectedOptions);
    } else {
      setOptions([...selectedOptions, ...remainingOptions]);
    }

    setFieldValue(
      props.id,
      selectedOptions.map((item) => item.value)
    );
  };

  const filterOptionsKeepingSelectedOnTop = (
    optionsList: IMultiAutocompleteFieldOption[],
    state: FilterOptionsState<IMultiAutocompleteFieldOption>
  ) => {
    const existingValues = get(values, props.id);
    const [selectedOptions, remainingOptions] = [
      optionsList.filter((item) => existingValues.includes(item.value)),
      optionsList.filter((item) => !existingValues.includes(item.value))
    ];
    const filterOptions = createFilterOptions<IMultiAutocompleteFieldOption>();
    return [...selectedOptions, ...filterOptions(remainingOptions, state)];
  };

  const handleFiltering = (
    optionsList: IMultiAutocompleteFieldOption[],
    state: FilterOptionsState<IMultiAutocompleteFieldOption>
  ) => {
    // For api-search selected will be always on top and options doesn't need to be filtered
    // as search funciton maintains both of this.
    return props.type === 'api-search' ? optionsList : filterOptionsKeepingSelectedOnTop(optionsList, state);
  };

  return (
    <Autocomplete
      multiple
      noOptionsText="Type to start searching"
      autoHighlight={true}
      value={getExistingValue(get(values, props.id))}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      id={props.id}
      data-testid={props.id}
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionSelected={handleGetOptionSelected}
      disableCloseOnSelect
      disableListWrap
      classes={classes}
      inputValue={inputValue}
      onInputChange={handleOnInputChange}
      onChange={handleOnChange}
      filterOptions={handleFiltering}
      renderOption={(option, { selected }) => {
        return (
          <>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
              disabled={(props.options && props.options?.indexOf(option) !== -1) || false}
              value={option.value}
              color="default"
            />
            {option.label}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={props.id}
          required={props.required}
          label={props.label}
          variant="outlined"
          fullWidth
          error={get(touched, props.id) && Boolean(get(errors, props.id))}
          helperText={get(touched, props.id) && get(errors, props.id)}
        />
      )}
    />
  );
};

export default MultiAutocompleteFieldVariableSize;
