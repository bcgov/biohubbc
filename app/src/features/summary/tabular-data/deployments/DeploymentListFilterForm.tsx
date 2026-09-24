import { AnimalAutocompleteField } from 'components/fields/AnimalAutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

export type IAllDeploymentAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  system_user_id?: number;
  device_serial?: string;
  species?: number;
  animal_alias?: string;
};

export const DeploymentAdvancedFiltersInitialValues: IAllDeploymentAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  start_date: undefined,
  end_date: undefined,
  start_time: undefined,
  end_time: undefined,
  system_user_id: undefined,
  device_serial: undefined,
  species: undefined,
  animal_alias: undefined
};

export interface IAllDeploymentListFilterFormProps {
  handleSubmit: (filterValues: IAllDeploymentAdvancedFilters) => void;
  initialValues?: IAllDeploymentAdvancedFilters;
}

/**
 * Deployment advanced filters
 *
 * @param {IAllDeploymentListFilterFormProps} props
 * @return {*}
 */
export const DeploymentListFilterForm = (props: IAllDeploymentListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const taxonomyContext = useTaxonomyContext();

  return (
    <Formik initialValues={initialValues ?? DeploymentAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <SpeciesAutocompleteField
              formikFieldName="species"
              label="Species"
              placeholder="Search by species"
              defaultSpecies={
                (initialValues?.species &&
                  taxonomyContext.getCachedSpeciesTaxonomyByIdAsync(Number(initialValues.species))) ||
                undefined
              }
              handleSpecies={(value) => {
                if (value?.tsn) {
                  formikProps.setFieldValue('species', value.tsn);
                }
              }}
              handleClear={() => {
                formikProps.setFieldValue('species', undefined);
              }}
              key="deployment-species-filter"
            />,
            <CustomTextField
              name="device_serial"
              label="Device Serial"
              other={{
                placeholder: 'Search by device serial number'
              }}
              key="deployment-device-serial-filter"
            />,
            <AnimalAutocompleteField
              formikFieldName="animal_alias"
              label="Animal Alias"
              placeholder="Search by animal nickname"
              onSelect={(animal) => {
                if (animal?.animal_id) {
                  formikProps.setFieldValue('animal_alias', animal.animal_id);
                }
              }}
              key="deployment-animal-alias-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};
