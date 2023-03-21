import { Box } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
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
    <>
      <Box display="flex" alignItems="center" pl={2} py={1.5}>
        <Checkbox
          edge="start"
          checked={selected}
          onChange={() => {
            if (selected) {
              resetForm();
              setSelected(false);
            } else {
              handleAll();
              setSelected(true);
            }
          }}
          name={`select-all`}
          color="primary"></Checkbox>
        <Box ml={1}>
          <Typography variant="body2">
            <strong>SELECT ALL</strong>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default SelectAllButton;
