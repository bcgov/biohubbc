import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import ProjectsSearchFilters from './ProjectsSearchFilters';

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  handleReset: () => void;
}

const ProjectsListFilterForm: React.FC<IProjectsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((values: IProjectAdvancedFilters) => {
        props.handleSubmit(values);
      }, 300),
    []
  );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
        <ProjectsSearchFilters onChange={debounced} />
      </Formik>
    </Box>
  );
};

export default ProjectsListFilterForm;
