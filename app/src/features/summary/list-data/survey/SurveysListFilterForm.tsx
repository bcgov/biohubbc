import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/projects/components/SearchFilters';
import SystemUserAutocomplete from 'features/projects/components/SystemUserAutocomplete';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';

export interface ISurveyAdvancedFilters {
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  system_user_id: number;
  itis_tsns: number[];
}

export const SurveyAdvancedFiltersInitialValues: ISurveyAdvancedFilters = {
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  system_user_id: '' as unknown as number,
  itis_tsns: []
};

export interface ISurveysListFilterFormProps {
  handleSubmit: (filterValues: ISurveyAdvancedFilters) => void;
  handleReset: () => void;
}

/**
 * Survey advanced filters.
 *
 * @param {*} props
 * @return {*}
 */
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
        <SearchFilters
          onChange={debounced}
          fields={[
            {
              id: 1,
              name: '',
              component: <CustomTextField placeholder="Search by keyword" name="keyword" label="Keyword" />
            },
            {
              id: 2,
              name: 'species',
              component: (
                <SpeciesAutocompleteField
                  formikFieldName={'itis_tsns'}
                  label={'Species'}
                  placeholder="Search by taxon"
                  handleSpecies={(value) => {
                    formikRef.current?.setFieldValue('itis_tsns', value?.tsn);
                  }}
                  handleClear={() => {
                    formikRef.current?.setFieldValue('itis_tsns', '');
                  }}
                  clearOnSelect={true}
                  showSelectedValue={true}
                />
              )
            },
            {
              id: 3,
              name: 'system_user_id',
              component: (
                <SystemUserAutocomplete
                  label="Person"
                  placeholder="Find Projects that a person has access to"
                  formikFieldName="system_user_id"
                  showSelectedValue={true}
                />
              )
            }
          ]}
        />
      </Formik>
    </Box>
  );
};

export default SurveysListFilterForm;
