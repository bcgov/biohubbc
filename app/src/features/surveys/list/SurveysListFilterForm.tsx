import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { ISurveyAdvancedFilters } from './SurveysListContainer';
import SurveysSearchFilters from './SurveysSearchFilters';

export interface ISurveysListFilterFormProps {
  handleSubmit: (filterValues: ISurveyAdvancedFilters) => void;
  handleReset: () => void;
}

export const SurveyAdvancedFiltersInitialValues: ISurveyAdvancedFilters = {
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  system_user_id: '',
  itis_tsns: []
};

const SurveysListFilterForm: React.FC<ISurveysListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<ISurveyAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((values: ISurveyAdvancedFilters) => {
        props.handleSubmit(values);
      }, 300),
    []
  );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={SurveyAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
        <SurveysSearchFilters onChange={debounced} />
      </Formik>
    </Box>
  );
};

export default SurveysListFilterForm;
