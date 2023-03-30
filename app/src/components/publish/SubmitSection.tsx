import { Box, makeStyles, Theme, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { grey } from '@material-ui/core/colors';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  sectionTitle: {
    letterSpacing: '0.02rem',
    textTransform: 'uppercase',
    background: grey[100]
  }
}));

export interface ISubmitSectionProps extends IDisplayFilesProps {
  subHeader: string;
}

interface IDisplayFilesProps {
  formikName: string;
  getName: (item: any) => string;
  data: any;
}

const SubmitSection: React.FC<ISubmitSectionProps> = (props) => {
  const classes = useStyles();
  const { subHeader, formikName, getName, data } = props;

  return (
    <Box mb={2}>
      <Box py={1.75} px={2} className={classes.sectionTitle}>
        <Typography variant="body2" color="textSecondary">
          <strong>
            {subHeader} {data && data.length > 1 ? `(${data.length})` : ''}
          </strong>
        </Typography>
      </Box>
      <DisplayFiles data={data} formikName={formikName} getName={getName} />
    </Box>
  );
};

const DisplayFiles: React.FC<IDisplayFilesProps> = (props) => {
  const { values } = useFormikContext<any>();
  const { formikName, getName, data } = props;

  if (!data || !data.length) {
    return (
      <Box pl={2} py={2}>
        <Typography variant="body2" color="textSecondary">
          Nothing to submit
        </Typography>
      </Box>
    );
  }

  const isChecked = (item: any) => {
    return values[formikName].find((value: any) => getName(value) === getName(item)) ? true : false;
  };

  return (
    <List disablePadding>
      <FieldArray
        name={formikName}
        render={(arrayHelpers) => (
          <>
            {data.map((item: any, index: number) => (
              <ListItem
                onClick={() => {
                  const currentTarget = values[formikName].findIndex((value: any) => getName(value) === getName(item));

                  if (currentTarget === -1) {
                    arrayHelpers.push(item);
                  } else {
                    arrayHelpers.remove(currentTarget);
                  }
                }}
                key={`${formikName}[${item.id}]`}
                dense
                divider>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isChecked(item)}
                    name={`${formikName}[${index}]`}
                    color="primary"></Checkbox>
                </ListItemIcon>
                <ListItemText>
                  <strong>{getName(item)}</strong>
                </ListItemText>
              </ListItem>
            ))}
          </>
        )}
      />
    </List>
  );
};
export default SubmitSection;
