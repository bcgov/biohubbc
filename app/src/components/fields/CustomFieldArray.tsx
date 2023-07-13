import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { get } from 'lodash-es';

const useStyles = makeStyles({
  list: {
    '& li': {
      border: `1px solid ${grey[400]}`
    },
    '& li + li': {
      borderTop: 'none'
    },
    '& li:first-of-type': {
      mt: 1,
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px'
    },
    '& li:last-of-type': {
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px'
    }
  },
  listItem: {
    borderStyle: 'solid',
    borderColor: 'grey.300'
  },
  listItemText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});

export interface CustomFieldArrayProps<ValueType = unknown> {
  /**
   * The name of the array field.
   *
   * @type {string}
   * @memberof CustomFieldArrayProps
   */
  name: string;
  /**
   * Get a label for the raw array value.
   *
   * @memberof CustomFieldArrayProps
   */
  getLabelForValue: (value: ValueType) => {
    primaryLabel: string;
    secondaryLabel?: string;
  };
}

/**
 * Render a list of items (with a delete button) for each item in an array field control, identified by its `name`.
 *
 * @example
 * <CustomFieldArray<SomeValueType> name="array_field_name" getLabelForValue={(value) => SomeLabelLookup(value)} />
 *
 * @param {*} props
 * @return {*}
 */
const CustomFieldArray = <ValueType extends Record<string, any>>(props: CustomFieldArrayProps<ValueType>) => {
  const classes = useStyles();

  const formikProps = useFormikContext();

  const values = get(formikProps.values, props.name);

  if (!values || !Array.isArray(values) || !values.length) {
    return <></>;
  }

  return (
    <FieldArray
      name={props.name}
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <List disablePadding className={classes.list}>
            {values.map((value: ValueType, index: number) => {
              const label = props.getLabelForValue(value);
              return (
                <ListItem key={`listItem-${label.primaryLabel}`} className={classes.listItem}>
                  <ListItemText
                    primary={label.primaryLabel}
                    secondary={label.secondaryLabel}
                    className={classes.listItemText}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      aria-label="Delete list item"
                      onClick={() => {
                        arrayHelpers.remove(index);
                      }}>
                      <Icon path={mdiTrashCanOutline} size={0.875} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </>
      )}
    />
  );
};

export default CustomFieldArray;
