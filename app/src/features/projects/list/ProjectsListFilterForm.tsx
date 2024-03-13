import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ProjectAdvancedFilters, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { Formik, FormikProps } from 'formik';
import React, { useRef } from 'react';

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  handleReset: () => void;
}

const ProjectsListFilterForm: React.FC<IProjectsListFilterFormProps> = (props) => {

  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  return (
    <Box>
      <Box p={3}>
        <Formik innerRef={formikRef} initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
          <Stack gap={3}>
            <ProjectAdvancedFilters />
            <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => formikRef.current?.handleSubmit()}>
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  props.handleReset();
                  formikRef.current?.resetForm();
                }}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Formik>
      </Box>
      <Divider></Divider>
    </Box>
  );
};

export default ProjectsListFilterForm;
