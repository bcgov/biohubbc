import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import assert from 'assert';
import ProjectAdvancedFilters, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import React, { useContext, useRef, useState } from 'react';

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
  const { handleSubmit, handleReset } = props;
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);

  const [formikRef] = useState(useRef<FormikProps<IProjectAdvancedFilters>>(null));

  return (
    <Box>
      <Box p={3}>
        <Formik innerRef={formikRef} initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
          <>
            <ProjectAdvancedFilters
              coordinator_agency={
                codesContext.codesDataLoader.data.agency?.map((item) => {
                  return item.name;
                }) || []
              }
              funding_sources={
                codesContext.codesDataLoader.data.agency?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
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
                  handleReset();
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
