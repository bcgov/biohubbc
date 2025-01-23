import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { SubcountCommentForm } from 'features/surveys/observations/form/components/subcounts/components/comment/SubcountCommentForm';
import { SubcountCountField } from 'features/surveys/observations/form/components/subcounts/components/measurements/components/SubcountCountField';
import { SubcountMeasurementRowForm } from 'features/surveys/observations/form/components/subcounts/components/measurements/SubcountMeasurementRowForm';
import { SubcountFormData } from 'features/surveys/observations/form/ObservationForm.interface';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';

// Define the validation schema for each subcount
export const subcountValidationSchema = yup.object({
  observation_subcount_id: yup.number().nullable(),
  count: yup.number().nullable().required('A subcount is required'),
  comment: yup.string().nullable(),
  measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().nullable().required('A measurement ID is required'),
      // Null values are allowed, which implies the value is unknown
      measurement_option_id: yup.string().nullable(),
      measurement_value: yup.number().nullable()
    })
  )
});

export const initialSubcountFormData = {
  observation_subcount_id: null,
  subcount: null,
  comment: null,
  measurements: []
};

export interface ISubcountFormProps {
  formikPrefixPath: string;
  subcountFormData: SubcountFormData;
  measurementTypeDefinitions: CBMeasurementType[];
  onDeleteMeasurement: (taxonMeasurementId: string) => void;
  enableHeaders?: boolean;
}

/**
 * Form component for a single observation subcount.
 *
 * @param {ISubcountFormProps} props
 * @return {*}
 */
export const SubcountForm = (props: ISubcountFormProps) => {
  const { formikPrefixPath, subcountFormData, measurementTypeDefinitions, onDeleteMeasurement, enableHeaders } = props;

  console.log('SubcountForm: ', formikPrefixPath);

  return (
    <Stack flexDirection="column" gap={2}>
      <Stack flexDirection="row" gap={1}>
        {/* Render the subcount count field */}
        <Box flex="1 1 auto" minWidth="200px">
          <SubcountCountField formikPrefixPath={formikPrefixPath} displayHeader={enableHeaders} />
        </Box>

        {/* Render the subcount measurement fields */}
        <SubcountMeasurementRowForm
          key={subcountFormData._id}
          formikPrefixPath={`${formikPrefixPath}.measurements`}
          subcount={subcountFormData}
          measurementTypeDefinitions={measurementTypeDefinitions}
          onDeleteMeasurement={onDeleteMeasurement}
          enableHeaders={enableHeaders}
        />
      </Stack>

      <SubcountCommentForm formikPrefixPath={formikPrefixPath} />
    </Stack>
  );
};
