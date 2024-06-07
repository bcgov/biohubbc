import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { Formik, FormikProps } from 'formik';
import { debounce } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import SearchFilters from '../../../projects/components/SearchFilters';
import SystemUserAutocomplete from '../../../projects/components/SystemUserAutocomplete';

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  handleReset: () => void;
  //   params: URLSearchParams;
  paginationSort: {
    limit?: number;
    page?: number;
    sort?: string;
    order?: 'desc' | 'asc';
  };
}

const ProjectsListFilterForm: React.FC<IProjectsListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  const debounced = useMemo(
    () =>
      debounce((_values: IProjectAdvancedFilters) => {
        // props.handleSubmit(values);
        // console.log(values);
        // updateUrl(values);
      }, 300),
    []
  );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={props.paginationSort} onSubmit={props.handleSubmit}>
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
                  placeholder="Search by user"
                  handleSpecies={(value) => {
                    formikRef.current?.setFieldValue('itis_tsns', value?.tsn);
                    formikRef.current?.submitForm();
                  }}
                  handleClear={() => {
                    formikRef.current?.setFieldValue('itis_tsns', '');
                    formikRef.current?.submitForm();
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
                  placeholder="Search by user"
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
