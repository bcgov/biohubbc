import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SubcountCountField } from 'features/surveys/observations/form/components/subcounts/subcount/count/SubcountCountField';
import {
  initialSubcountMeasurementsFormData,
  SubcountMeasurementsForm
} from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountMeasurementsForm';
import { SubcountFormData } from 'features/surveys/observations/form/components/subcounts/subcount/SubcountForm.interface';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { v4 } from 'uuid';
import { SubcountCommentForm } from './comment/SubcountCommentForm';

const initialSubcountFormData: SubcountFormData = {
  _id: v4(),
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
