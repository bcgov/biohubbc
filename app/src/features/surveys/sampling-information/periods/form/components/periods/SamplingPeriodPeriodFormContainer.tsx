import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AlertBar from 'components/alert/AlertBar';
import {
  InitialSurveySamplePeriodPeriodFormData,
  SamplePeriodPeriodForm
} from 'features/surveys/sampling-information/periods/form/components/periods/SamplePeriodPeriodForm';
import { ISurveySamplePeriodFormData } from 'features/surveys/sampling-information/periods/form/SamplePeriodForm';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { v4 } from 'uuid';

export interface ISamplingPeriodPeriodFormContainerProps {
  /**
   * Limit the number of periods that can be removed. If not provided, there is no limit.
   *
   * @type {number}
   * @memberof ISamplingPeriodPeriodFormContainerProps
   */
  minimumNumberOfPeriods?: number;
  /**
   * Limit the number of periods that can be added. If not provided, there is no limit.
   *
   * @type {boolean}
   * @memberof ISamplingPeriodPeriodFormContainerProps
   */
  maximumNumberOfPeriods?: number;
}

export const SamplingPeriodPeriodFormContainer = (props: ISamplingPeriodPeriodFormContainerProps) => {
  const { minimumNumberOfPeriods, maximumNumberOfPeriods } = props;

  const { values, errors } = useFormikContext<ISurveySamplePeriodFormData>();

  const isAddPeriodButtonDisabled = maximumNumberOfPeriods && values.sample_periods.length >= maximumNumberOfPeriods;

  const isDeletePeriodDisabled =
    minimumNumberOfPeriods !== undefined && values.sample_periods.length <= (props.minimumNumberOfPeriods ?? 0);

  const alertBarErrorText = errors.sample_periods && typeof errors.sample_periods === 'string' && errors.sample_periods;

  return (
    <FieldArray
      name="sample_periods"
      render={(arrayHelpers: FieldArrayRenderProps) => {
        return (
          <Box>
            {values.sample_periods.map((period, index) => {
              return (
                <Grid container spacing={3} mb={3} key={period.survey_sample_period_id ?? period.id}>
                  <Grid item xs={12}>
                    <SamplePeriodPeriodForm
                      index={index}
                      isDeleteDisabled={isDeletePeriodDisabled}
                      onDelete={() => {
                        arrayHelpers.remove(index);
                      }}
                    />
                  </Grid>
                </Grid>
              );
            })}
            {!isAddPeriodButtonDisabled && (
              <Button
                sx={{
                  alignSelf: 'flex-start'
                }}
                data-testid="sampling-period-add-button"
                variant="outlined"
                color="primary"
                title="Add Period"
                aria-label="Create Sample Period"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() =>
                  arrayHelpers.push({
                    ...InitialSurveySamplePeriodPeriodFormData,
                    // Temporary id used as the unique key on the frontend, not to be sent to the backend
                    id: v4()
                  })
                }>
                Add Period
              </Button>
            )}

            {alertBarErrorText && (
              <Box sx={{ mt: 5 }}>
                <AlertBar severity="error" variant="outlined" title="Missing Detail" text={alertBarErrorText} />
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
};
