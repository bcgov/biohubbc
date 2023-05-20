import { Box, makeStyles, Theme, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { grey } from '@material-ui/core/colors';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { FieldArray, FormikValues, useFormikContext } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  sectionTitle: {
    letterSpacing: '0.02rem',
    textTransform: 'uppercase',
    background: grey[100]
  },
  selectAll: {
    textTransform: 'uppercase'
  }
}));

interface IFormikSubmitSection<T extends { id: number }> {
  formikKey: string;
  formikData: T[];
  label: string;
  getName: (item: T) => string;
}

interface ISubmitSectionProps {
  sections: IFormikSubmitSection<any>[]
}

const SubmitSections = <Values extends FormikValues>(props: ISubmitSectionProps) => {
  const formikContext = useFormikContext<Values>();
  const classes = useStyles();

  const allSelected = props.sections.every((section) => section.formikData.length === formikContext.values[section.formikKey].length);
  const someSelected = props.sections.some((section) => formikContext.values[section.formikKey].length > 0);

  return (
    <>
      <List disablePadding>
        <ListItem
          onClick={() => {
            if (allSelected) {
              formikContext.resetForm();
              return;
            }

            props.sections.forEach((section) => formikContext.setFieldValue(section.formikKey, section.formikData))
          }}
          key={`select-all`}
          dense
          divider>
          <ListItemIcon>
            <Checkbox edge="start" checked={allSelected} indeterminate={someSelected && !allSelected} name="select-all" color="primary"></Checkbox>
          </ListItemIcon>
          <ListItemText className={classes.selectAll}>
            <strong>Select All</strong>
          </ListItemText>
        </ListItem>
      </List>
      {props.sections.map((section: IFormikSubmitSection<any>) => {
        const { formikData, label, formikKey, getName } = section;

        /*
        const handleAll = () => {
          formikData.forEach((item) => {
            setFieldValue(item.key, item.value);
          });
        };
        */

        return (
          <Box mb={2}>
            <Box py={1.75} px={2} className={classes.sectionTitle}>
              <Typography variant="body2" color="textSecondary">
                <strong>
                  {`${label} ${formikData && formikData.length > 1 ? `(${formikData.length})` : ''}`}
                </strong>
              </Typography>
            </Box>
            {!formikData || !formikData.length ? (
              <Box pl={2} py={2}>
                <Typography variant="body2" color="textSecondary">
                  Nothing to submit
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                <FieldArray
                  name={formikKey}
                  render={(arrayHelpers) => (
                    <>
                      {formikData.map((item, index: number) => {
                        const checkedIndex = formikContext.values[formikKey].findIndex((data: unknown) => getName(data) === getName(item));
                        const isChecked = checkedIndex !== -1;

                        return (
                          <ListItem
                            onClick={() => isChecked ? arrayHelpers.remove(checkedIndex) : arrayHelpers.push(item)}
                            key={`${formikKey}[${item.id}]`}
                            dense
                            divider>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={isChecked}
                                name={`${label}[${index}]`}
                                color="primary"></Checkbox>
                            </ListItemIcon>
                            <ListItemText>
                              <strong>{getName(item)}</strong>
                            </ListItemText>
                          </ListItem>
                        )}
                      )}
                    </>
                  )}
                />
              </List>
            )}
          </Box>
        )
      })}
    </>
  )
}

export default SubmitSections;
