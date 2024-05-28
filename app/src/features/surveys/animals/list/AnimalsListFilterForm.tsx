import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { IAnimalsAdvancedFilters } from './AnimalsListContainer';
import AnimalsSearchFilters from './AnimalsSearchFilters';

export interface IAnimalsListFilterFormProps {
  handleSubmit: (filterValues: IAnimalsAdvancedFilters) => void;
  handleReset: () => void;
}

export const ObservationAdvancedFiltersInitialValues: IAnimalsAdvancedFilters = {
  itis_tsns: []
};

const AnimalsListFilterForm: React.FC<IAnimalsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IAnimalsAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((values: IAnimalsAdvancedFilters) => {
        props.handleSubmit(values);
      }, 300),
    []
  );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik
        innerRef={formikRef}
        initialValues={ObservationAdvancedFiltersInitialValues}
        onSubmit={props.handleSubmit}>
        <AnimalsSearchFilters onChange={debounced} />
      </Formik>
    </Box>
  );
};

export default AnimalsListFilterForm;
