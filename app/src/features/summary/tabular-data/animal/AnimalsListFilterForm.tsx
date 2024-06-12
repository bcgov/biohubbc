import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/summary/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import React, { useRef } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { IAnimalsAdvancedFilters } from './AnimalsListContainer';

export interface IAnimalsListFilterFormProps {
  paginationSort: ApiPaginationRequestOptions;
  handleSubmit: (filterValues: IAnimalsAdvancedFilters) => void;
  handleReset: () => void;
}

export const AnimalsAdvancedFiltersInitialValues: IAnimalsAdvancedFilters = {
  itis_tsns: []
};

const AnimalsListFilterForm: React.FC<IAnimalsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IAnimalsAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  //   const debounced = useMemo(
  //     () =>
  //       debounce((values: IAnimalsAdvancedFilters) => {
  //         props.handleSubmit(values);
  //       }, 300),
  //     []
  //   );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={AnimalsAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
        <SearchFilters
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Type any keyword' }} />,
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
          ]}
        />
      </Formik>
    </Box>
  );
};

export default AnimalsListFilterForm;
