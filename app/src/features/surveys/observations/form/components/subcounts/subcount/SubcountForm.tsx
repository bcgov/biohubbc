import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SubcountCountField } from 'features/surveys/observations/form/components/subcounts/subcount/count/SubcountCountField';
import {
  initialSubcountMeasurementsFormData,
  SubcountMeasurementsForm
} from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountMeasurementsForm';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { SubcountCommentForm } from './comment/SubcountCommentForm';

export type SubcountFormData = {
  /**
   * Unique id for react keys.
   */
  _id?: string;
  /**
   * The subcount record id.
   *
   * Will be null when creating a new subcount record, and will be non-null when editing an existing subcount record.
   */
  observation_subcount_id: number | null;
  /**
   * The count value for the subcount record.
   *
   * Ex: How many of the species were observed.
   */
  subcount: number | null;
  /**
   * The comment for the subcount record.
   */
  comment: string | null;
  /**
   * The markings for the subcount record.
   *
   * // TODO - future enhancement
   */
  markings?: never[];
} & SubcountMeasurementsForm;

export const initialSubcountFormData: SubcountFormData = {
  observation_subcount_id: null,
  subcount: null,
  comment: null,
  ...initialSubcountMeasurementsFormData
};

export interface ISubcountFormProps {
  formikFieldName: string;
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
  const { formikFieldName, measurementTypeDefinitions, onDeleteMeasurement, enableHeaders } = props;

  return (
    <Stack flexDirection="column" gap={2} sx={{ flex: '1 1 auto' }}>
      <Paper
        component={Stack}
        variant="outlined"
        flexDirection="row"
        gap={1}
        p={2}
        sx={{ flex: '1 1 auto', bgcolor: grey[50] }}>
        {/* Render the subcount count field */}
        <Box flex="1 1 auto" minWidth="200px">
          <SubcountCountField formikFieldName={formikFieldName} displayHeader={enableHeaders} />
        </Box>

        {/* Render the subcount measurement fields */}
        <Stack flexDirection="row" gap={1}>
          <SubcountMeasurementsForm
            formikFieldName={formikFieldName}
            measurementTypeDefinitions={measurementTypeDefinitions}
            onDeleteMeasurement={onDeleteMeasurement}
            enableHeaders={enableHeaders}
          />
        </Stack>

        {/* Render the subcount comment field */}
        <Box flex="1 1 auto" minWidth="300px">
          <SubcountCommentForm formikFieldName={formikFieldName} displayHeader={enableHeaders} />
        </Box>
      </Paper>
    </Stack>
  );
};
