import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import SystemUserAutocomplete from '../components/SystemUserAutocomplete';
import SearchFilters from '../components/SearchFilters';

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
        <SearchFilters
          onChange={debounced}
          fields={[
            {
              id: 1,
              name: '',
              component: (
                <CustomTextField
                  placeholder="Type any keyword"
                  name="keyword"
                  label="Keyword"
                  other={{ sx: { pl: 1 } }}
                />
              )
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
            },
            {
              id: 3,
              name: 'system_user_id',
              component: (
                <SystemUserAutocomplete
                  label="Person"
                  formikFieldName="system_user_id"
                  required={false}
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

export default ProjectsListFilterForm;
