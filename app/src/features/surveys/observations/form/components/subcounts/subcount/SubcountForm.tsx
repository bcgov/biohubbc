import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SubcountCountField } from 'features/surveys/observations/form/components/subcounts/subcount/count/SubcountCountField';
import { SubcountMeasurementsForm } from 'features/surveys/observations/form/components/subcounts/subcount/measurements/SubcountMeasurementsForm';
import { useFormikContext } from 'formik';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { SubcountCommentForm } from './comment/SubcountCommentForm';
import { CritterSelectField } from './critter/SubcountCritterSelectField';

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

  const { values, setFieldValue } = useFormikContext();

  // Get the current critter selection for this subcount
  const critterbaseId = get(values, `${formikFieldName}.critterbase_critter_id`);
  const currentSubcount = get(values, `${formikFieldName}.subcount`);

  // When a critter is selected, set subcount to 1
  useEffect(() => {
    if (critterbaseId && currentSubcount !== 1) {
      setFieldValue(`${formikFieldName}.subcount`, 1);
    }
  }, [critterbaseId, currentSubcount, formikFieldName, setFieldValue]);

  // Determine if the count field should be read-only
  const isCountReadOnly = Boolean(critterbaseId);

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
          <SubcountCountField
            formikFieldName={formikFieldName}
            displayHeader={enableHeaders}
            readOnly={isCountReadOnly}
          />
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

        {/* Render the critter selection field */}
        <Box flex="1 1 auto" minWidth="200px">
          <CritterSelectField
            formikFieldName={`${formikFieldName}.critterbase_critter_id`}
            displayHeader={enableHeaders}
          />
        </Box>
      </Paper>
    </Stack>
  );
};
