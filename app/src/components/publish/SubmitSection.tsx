import { Box, makeStyles, Theme, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  subHeader: {
    width: '100%',
    backgroundColor: '#dadada',
    opacity: '.5'
  },
  results: {
    width: '100%'
  }
}));

export interface ISubmitSectionProps {
  subHeader: string;
  formikName: string;
  nameLocation: string;
  data: any;
}

const SubmitSection: React.FC<ISubmitSectionProps> = (props) => {
  const classes = useStyles();

  const { subHeader, formikName, nameLocation, data } = props;

  const { values } = useFormikContext<any>();

  return (
    <>
      <Box className={classes.subHeader} boxShadow={2} pl={2} py={2}>
        <Typography variant="body1" style={{ color: '#787F81' }}>
          <strong>{subHeader}</strong> {data && data.length > 1 ? `(${data.length})` : ''}
        </Typography>
      </Box>
      {data && !!data.length ? (
        <Box className={classes.results} pl={2} py={2}>
          <FieldArray
            name={formikName}
            render={(arrayHelpers) => (
              <>
                {data.map((item: any, index: number) => (
                  <Box key={`${formikName}[${index}]`}>
                    <Checkbox
                      checked={
                        !values[formikName].find((value: any) => value[`${nameLocation}`] === item[`${nameLocation}`])
                          ? false
                          : true
                      }
                      onChange={() => {
                        const currentTarget = values[formikName].findIndex(
                          (value: any) => value[`${nameLocation}`] === item[`${nameLocation}`]
                        );

                        if (currentTarget === -1) {
                          arrayHelpers.push(item);
                        } else {
                          arrayHelpers.remove(currentTarget);
                        }
                      }}
                      name={`${formikName}[${index}]`}
                      color="primary"></Checkbox>{' '}
                    {item[`${nameLocation}`]}
                  </Box>
                ))}
              </>
            )}
          />
        </Box>
      ) : (
        <Box className={classes.results} pl={2} py={2}>
          {' '}
          - No {formikName} available
        </Box>
      )}
    </>
  );
};

export default SubmitSection;
