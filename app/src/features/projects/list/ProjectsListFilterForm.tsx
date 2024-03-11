import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import ProjectAdvancedFilters, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { Formik, FormikProps } from 'formik';
import React, { useRef } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    marginLeft: theme.spacing(1),
    minWidth: '6rem'
  }
}));

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  handleReset: () => void;
}

const ProjectsListFilterForm: React.FC<IProjectsListFilterFormProps> = (props) => {
  const classes = useStyles();

  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  return (
    <Box>
      <Box p={3}>
        <Formik innerRef={formikRef} initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
          <>
            <ProjectAdvancedFilters />
            <Box mt={3} display="flex" alignItems="center" justifyContent="flex-end">
              <Button
                className={classes.actionButton}
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => formikRef.current?.handleSubmit()}>
                Apply Filters
              </Button>
              <Button
                className={classes.actionButton}
                variant="outlined"
                color="primary"
                onClick={() => {
                  props.handleReset();
                  formikRef.current?.resetForm();
                }}>
                Clear
              </Button>
            </Box>
          </>
        </Formik>
      </Box>
      <Divider></Divider>
    </Box>
  );
};

export default ProjectsListFilterForm;
