import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/projects/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { IAnimalsAdvancedFilters } from './AnimalsListContainer';

export interface IAnimalsListFilterFormProps {
  handleSubmit: (filterValues: IAnimalsAdvancedFilters) => void;
  handleReset: () => void;
}

export const AnimalsAdvancedFiltersInitialValues: IAnimalsAdvancedFilters = {
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
      <Formik innerRef={formikRef} initialValues={AnimalsAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
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

export default AnimalsListFilterForm;
