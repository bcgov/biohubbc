import Checkbox from '@material-ui/core/Checkbox';
import ListSubheader from '@material-ui/core/ListSubheader';
import TextField from '@material-ui/core/TextField';
import CheckBox from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete from '@material-ui/lab/Autocomplete';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFormikContext } from 'formik';
import React from 'react';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import get from 'lodash-es/get';

const LISTBOX_PADDING = 8; // px

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
}

export interface IMultiAutocompleteField {
  id: string;
  label: string;
  options: IMultiAutocompleteFieldOption[];
  required?: boolean;
  filterLimit?: number;
}

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

  const getExistingValue = (existingValues: any[]): IMultiAutocompleteFieldOption[] => {
    if (!existingValues) {
      return [];
    }

    return props.options.filter((option) => existingValues.includes(option.value));
  };

  const handleGetOptionSelected = (
    option: IMultiAutocompleteFieldOption,
    value: IMultiAutocompleteFieldOption
  ): boolean => {
    if (!option?.value || !value?.value) {
      return false;
    }

    return option.value === value.value;
  };

  return (
    <Autocomplete
      multiple
      autoHighlight={true}
      value={getExistingValue(get(values, props.id))}
      ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
      id={props.id}
      data-testid={props.id}
      options={props.options}
      getOptionLabel={(option) => option.label}
      getOptionSelected={handleGetOptionSelected}
      disableCloseOnSelect
      disableListWrap
      classes={classes}
      onChange={(event, option) => {
        setFieldValue(
          props.id,
          option.map((item) => item.value)
        );
      }}
      renderOption={(option, { selected }) => {
        const disabled: any = props.options && props.options?.indexOf(option) !== -1;
        return (
          <>
            <Checkbox
              icon={<CheckBoxOutlineBlank fontSize="small" />}
              checkedIcon={<CheckBox fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
              disabled={disabled}
              value={option.value}
            />
            {option.label}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
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
