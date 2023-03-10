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
    <>
      <Box className={classes.subHeader} boxShadow={2} pl={2} py={2}>
        <Typography variant="body1" style={{ color: '#787F81' }}>
          <strong>{subHeader}</strong> {data && data.length > 1 ? `(${data.length})` : ''}
        </Typography>
      </Box>
      <DisplayFiles data={data} formikName={formikName} getName={getName} />
    </>
  );
};

const DisplayFiles: React.FC<IDisplayFilesProps> = (props) => {
  const classes = useStyles();
  const { values } = useFormikContext<any>();

  const { formikName, getName, data } = props;

  if (!data || !data.length) {
    return (
      <Box className={classes.results} pl={2} py={2}>
        - No {formikName} available
      </Box>
    );
  }

  return (
    <Box className={classes.results} pl={2} py={2}>
      <FieldArray
        name={formikName}
        render={(arrayHelpers) => (
          <>
            {data.map((item: any, index: number) => (
              <Box key={`${formikName}[${item.id}]`}>
                <Checkbox
                  checked={!values[formikName].find((value: any) => getName(value) === getName(item)) ? false : true}
                  onChange={() => {
                    const currentTarget = values[formikName].findIndex(
                      (value: any) => getName(value) === getName(item)
                    );

                    if (currentTarget === -1) {
                      arrayHelpers.push(item);
                    } else {
                      arrayHelpers.remove(currentTarget);
                    }
                  }}
                  name={`${formikName}[${index}]`}
                  color="primary"></Checkbox>{' '}
                {getName(item)}
              </Box>
            ))}
          </>
        )}
      />
    </Box>
  );
};
export default SubmitSection;
