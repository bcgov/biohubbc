import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import {
  InitialSurveySamplePeriodPeriodFormData,
  SamplePeriodPeriodForm
} from 'features/surveys/sampling-information/periods/form/components/periods/SamplePeriodPeriodForm';
import { ISurveySamplePeriodFormData } from 'features/surveys/sampling-information/periods/form/SamplePeriodForm';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { v4 } from 'uuid';

export interface ISamplingPeriodPeriodFormContainerProps {
  /**
   * Limit the number of periods that can be added. If not provided, there is no limit.
   *
   * @type {boolean}
   * @memberof ISamplingPeriodPeriodFormContainerProps
   */
  maximumNumberOfPeriods?: number;
}

export const SamplingPeriodPeriodFormContainer = (props: ISamplingPeriodPeriodFormContainerProps) => {
  const { maximumNumberOfPeriods } = props;

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
            <Button
              sx={{
                alignSelf: 'flex-start',
                mt: 3
              }}
              data-testid="sampling-period-add-button"
              variant="outlined"
              color="primary"
              title="Add Period"
              disabled={maximumNumberOfPeriods ? values.sample_periods.length >= maximumNumberOfPeriods : false}
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
          </Box>
        );
      }}
    />
  );
};
