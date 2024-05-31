import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/projects/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { IObservationsAdvancedFilters } from './ObservationsListContainer';

export interface IObservationsListFilterFormProps {
  handleSubmit: (filterValues: IObservationsAdvancedFilters) => void;
  handleReset: () => void;
}

export const ObservationAdvancedFiltersInitialValues: IObservationsAdvancedFilters = {
  minimum_date: '',
  maximum_date: '',
  keyword: '',
  minimum_count: '',
  minimum_time: '',
  maximum_time: '',
  system_user_id: '' as unknown as number,
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
        <SearchFilters
          onChange={debounced}
          fields={[
            {
              id: 1,
              name: '',
              component: (
                <Box>
                  <CustomTextField placeholder="Enter any keyword or Observation ID" name="keyword" label="Keyword" />
                </Box>
              )
            },
            {
              id: 2,
              name: 'species',
              component: (
                <SpeciesAutocompleteField
                  formikFieldName={'itis_tsns'}
                  label={'Species'}
                  placeholder="Find observations of a specific taxon"
                  handleSpecies={(value) => {
                    if (value?.tsn) {
                      formikRef.current?.setFieldValue('itis_tsns', value?.tsn);
                    }
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
              name: 'minimum_date',
              component: <SingleDateField name={'minimum_date'} label={'Observed after'} />
            },
            {
              id: 4,
              name: 'maximum_date',
              component: <SingleDateField name={'maximum_date'} label={'Observed before'} />
            }
          ]}
        />
      </Formik>
    </Box>
  );
};

export default ObservationsListFilterForm;
