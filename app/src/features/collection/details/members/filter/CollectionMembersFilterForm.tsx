import { ICollectionMembersAdvancedFilters } from 'interfaces/useCollectionApi.interface';

export const CollectionParticipantsAdvancedFiltersInitialValues: ICollectionMembersAdvancedFilters = {
  keyword: undefined,
  system_user_id: undefined
};

import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

interface ICollectionMembersFilterFormProps {
  handleSubmit: (filterValues: ICollectionMembersAdvancedFilters) => void;
  initialValues?: ICollectionMembersAdvancedFilters;
}

/**
 * Survey advanced filters
 *
 * @param {ICollectionMembersFilterFormProps} props
 * @return {*}
 */
const CollectionParticipantsFilterForm = (props: ICollectionMembersFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  return (
    <Formik
      initialValues={initialValues ?? CollectionParticipantsAdvancedFiltersInitialValues}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField
              name="keyword"
              label="Keyword"
              other={{ placeholder: 'Search by keyword' }}
              key="survey-keyword-filter"
            />,
            <SystemUserAutocompleteField
              formikFieldName="system_user_id"
              label="User"
              onSelect={(value) => {
                if (value?.system_user_id) {
                  formikProps.setFieldValue('system_user_id', value.system_user_id);
                }
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_id', undefined);
              }}
              key="survey-user-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default CollectionParticipantsFilterForm;
