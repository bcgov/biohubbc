import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/projects/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { ITelemetryAdvancedFilters } from './TelemetryListContainer';

export interface ITelemetryListFilterFormProps {
  handleSubmit: (filterValues: ITelemetryAdvancedFilters) => void;
  handleReset: () => void;
}

export const TelemetryAdvancedFiltersInitialValues: ITelemetryAdvancedFilters = {
  itis_tsns: []
};

const TelemetryListFilterForm: React.FC<ITelemetryListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<ITelemetryAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((values: ITelemetryAdvancedFilters) => {
        props.handleSubmit(values);
      }, 300),
    [props]
  );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={TelemetryAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
        <SearchFilters
          onChange={debounced}
          fields={[
            {
              id: 1,
              name: '',
              component: <CustomTextField placeholder="Type any keyword" name="keyword" label="Keyword" />
            },
            {
              id: 2,
              name: 'species',
              component: (
                <SpeciesAutocompleteField
                  formikFieldName={'itis_tsns'}
                  label={'Species'}
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
            }
          ]}
        />
      </Formik>
    </Box>
  );
};

export default TelemetryListFilterForm;
