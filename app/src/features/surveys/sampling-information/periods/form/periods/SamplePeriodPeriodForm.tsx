import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';

export interface ISurveySampleMethodPeriodData {
  // Temporary id used as the unique key on the frontend, not to be sent to the backend
  id?: string;
  // Data for the request
  survey_sample_period_id: number | null;
  survey_sample_method_id: number | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

export const SurveySampleMethodPeriodArrayItemInitialValues: ISurveySampleMethodPeriodData = {
  // Temporary id used as the unique key on the frontend, not to be sent to the backend
  id: v4(),
  // Data for the request
  survey_sample_period_id: null,
  survey_sample_method_id: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

export const SamplingPeriodPeriodForm = () => {
  const formikProps = useFormikContext<ICreateSamplingPeriodRequest>();

  const { errors, values } = formikProps;

  return (
    <form>
      <FieldArray
        name="sample_periods"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <Box component="fieldset">
              <TransitionGroup>
                {values.sample_periods.map((period) => (
                  <Collapse>
                    <Box
                      component={Stack}
                      key={period.id}
                      flexDirection="row"
                      gap={1}
                      mt={2}
                      sx={{
                        '& .MuiFormHelperText-root': {
                          mb: -0.75
                        }
                      }}>
                      <Stack>
                        <DateTimeFields
                          date={{
                            dateLabel: 'Start Date',
                            dateName: `start_date`,
                            dateId: `start_date`,
                            dateRequired: true,
                            dateIcon: mdiCalendarMonthOutline
                          }}
                          time={{
                            timeLabel: '',
                            timeName: `start_time`,
                            timeId: `start_time`,
                            timeRequired: false,
                            timeIcon: mdiClockOutline
                          }}
                          formikProps={formikProps}
                        />
                        {errors && typeof errors !== 'string' && errors && typeof errors === 'string' && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              mt: '3px',
                              ml: '14px'
                            }}>
                            {String(errors)}
                          </Typography>
                        )}
                      </Stack>

                      <Box flex="0 0 auto" mt={2.25}>
                        <Icon path={mdiArrowRightThin} size={1} />
                      </Box>

                      <Stack>
                        <DateTimeFields
                          date={{
                            dateLabel: 'End Date',
                            dateName: `end_date`,
                            dateId: `end_date`,
                            dateRequired: true,
                            dateIcon: mdiCalendarMonthOutline
                          }}
                          time={{
                            timeLabel: '',
                            timeName: `end_time`,
                            timeId: `end_time`,
                            timeRequired: false,
                            timeIcon: mdiClockOutline
                          }}
                          formikProps={formikProps}
                        />
                        {errors && typeof errors !== 'string' && errors && typeof errors === 'string' && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              mt: '3px',
                              ml: '14px'
                            }}>
                            {String(errors)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Collapse>
                ))}
              </TransitionGroup>
              <Button
                sx={{
                  alignSelf: 'flex-start',
                  mt: 2
                }}
                data-testid="sampling-period-add-button"
                variant="outlined"
                color="primary"
                title="Add Period"
                aria-label="Create Sample Period"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => {
                  arrayHelpers.push(SurveySampleMethodPeriodArrayItemInitialValues);
                }}>
                Add Period
              </Button>
            </Box>
          </>
        )}
      />
    </form>
  );
};
