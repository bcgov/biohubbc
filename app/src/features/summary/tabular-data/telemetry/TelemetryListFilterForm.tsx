import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type IAllTelemetryAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  system_user_id?: number;
};

export const TelemetryAdvancedFiltersInitialValues: IAllTelemetryAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  start_date: undefined,
  end_date: undefined,
  start_time: undefined,
  end_time: undefined,
  system_user_id: undefined
};

export interface IAllTelemetryListFilterFormProps {
  handleSubmit: (filterValues: IAllTelemetryAdvancedFilters) => void;
  initialValues?: IAllTelemetryAdvancedFilters;
}

/**
 * Telemetry advanced filters
 *
 * @param {IAllTelemetryListFilterFormProps} props
 * @return {*}
 */
export const TelemetryListFilterForm = (props: IAllTelemetryListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  return (
    <Formik initialValues={initialValues ?? TelemetryAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      <FilterFieldsContainer
        fields={[
          <CustomTextField
            name="keyword"
            label="Keyword"
            other={{
              placeholder: 'Search by keyword'
            }}
            key="telemetry-keyword-filter"
          />,
          <SingleDateField name={'start_date'} label={'Recorded after'} key="telemetry-start-date-filter" />,
          <SingleDateField name={'end_date'} label={'Recorded before'} key="telemetry-end-date-filter" />
        ]}
      />
    </Formik>
  );
};
