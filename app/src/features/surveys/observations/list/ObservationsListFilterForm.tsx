import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { IObservationsAdvancedFilters } from './ObservationsListContainer';
import ObservationsSearchFilters from './ObservationsSearchFilters';

export interface IObservationsListFilterFormProps {
  handleSubmit: (filterValues: IObservationsAdvancedFilters) => void;
  handleReset: () => void;
}

export const ObservationAdvancedFiltersInitialValues: IObservationsAdvancedFilters = {
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  system_user_id: '',
  itis_tsns: []
};

const ObservationsListFilterForm: React.FC<IObservationsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IObservationsAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((values: IObservationsAdvancedFilters) => {
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
        <ObservationsSearchFilters onChange={debounced} />
      </Formik>
    </Box>
  );
};

export default ObservationsListFilterForm;
