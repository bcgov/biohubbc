import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';

export interface ISelectAllButtonProps {
  formikData: { key: string; value: any }[];
}

const SelectAllButton: React.FC<ISelectAllButtonProps> = (props) => {
  const [selected, setSelected] = React.useState(false);

  const { formikData } = props;
  const { resetForm, setFieldValue, values } = useFormikContext<any>();

  useEffect(() => {
    formikData.forEach((item) => {
      if (values[item.key] !== item.value) {
        setSelected(false);
      }
    });
  }, [formikData, values]);

  const handleAll = () => {
    formikData.forEach((item) => {
      setFieldValue(item.key, item.value);
    });
  };

  return (
    <List disablePadding>
      <ListItem
        onClick={() => {
          if (selected) {
            resetForm();
            setSelected(false);
          } else {
            handleAll();
            setSelected(true);
          }
        }}
        key={`select-all`}
        dense
        divider>
        <ListItemIcon>
          <Checkbox edge="start" checked={selected} name={`select-all`} color="primary"></Checkbox>
        </ListItemIcon>
        <ListItemText>
          <strong>SELECT ALL</strong>
        </ListItemText>
      </ListItem>
    </List>
  );
};

export default SelectAllButton;
