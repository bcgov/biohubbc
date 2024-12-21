import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import {
  InitialSurveySamplePeriodPeriodFormData,
  SamplePeriodPeriodForm
} from 'features/surveys/sampling-information/periods/form/components/periods/SamplePeriodPeriodForm';
import { ISurveySamplePeriodFormData } from 'features/surveys/sampling-information/periods/form/SamplePeriodForm2';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { v4 } from 'uuid';

export interface ISamplingPeriodPeriodForm2Props {
  /**
   * Set to `true` to disable the ability to add multiple periods to this form.
   *
   * @type {boolean}
   * @memberof ISamplingPeriodPeriodForm2Props
   */
  disableMultiplePeriods?: boolean;
}

export const SamplingPeriodPeriodForm2 = (props: ISamplingPeriodPeriodForm2Props) => {
  const { disableMultiplePeriods } = props;

  const { values } = useFormikContext<ISurveySamplePeriodFormData>();

  return (
    <FieldArray
      name="sample_periods"
      render={(arrayHelpers: FieldArrayRenderProps) => {
        return (
          <Box>
            {values.sample_periods.map((_period, index) => {
              return (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <SamplePeriodPeriodForm
                      index={index}
                      onDelete={() => {
                        arrayHelpers.remove(index);
                      }}
                    />
                  </Grid>
                </Grid>
              );
            })}
            {/* Disable the ability to add additional periods if editing an existing period. */}
            {!disableMultiplePeriods ? (
              <Button
                sx={{
                  alignSelf: 'flex-start',
                  mt: 3
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
            ) : null}
          </Box>
        );
      }}
    />
  );
};
