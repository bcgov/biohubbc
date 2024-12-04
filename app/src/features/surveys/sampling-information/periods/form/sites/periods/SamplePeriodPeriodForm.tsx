import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline, mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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

export const SamplePeriodPeriodForm = () => {
  const formikProps = useFormikContext<ICreateSamplingPeriodRequest>();

  const { values } = formikProps;

  return (
    <form>
      <FieldArray
        name="sample_periods"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <Timeline title="Sample Periods" sx={{ alignItems: 'start', justifyContent: 'start', p: 0, m: 0 }}>
              <TransitionGroup>
                {values.sample_periods.map((period, index) => (
                  <Collapse key={period.id}>
                    <TimelineItem
                      sx={{
                        width: '100%',
                        '&::before': {
                          content: 'none'
                        },
                        minHeight: '40px',
                        m: 0,
                        p: 0
                      }}>
                      <TimelineSeparator sx={{ minWidth: 0, ml: 1, mr: 2 }}>
                        {values.sample_periods.length > 1 && (
                          <Box display="flex" justifyContent="center" mt={4}>
                            <TimelineDot sx={{ bgcolor: grey[300], boxShadow: 'none' }} />
                            {index < values.sample_periods.length - 1 && (
                              <TimelineConnector
                                sx={{
                                  bgcolor: grey[300],
                                  position: 'absolute',
                                  height: '100%',
                                  top: 50
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box
                          component={Stack}
                          flexDirection="row"
                          gap={1}
                          mt={2}
                          sx={{
                            '& .MuiFormHelperText-root': {
                              mb: -0.75
                            }
                          }}>
                          {/* Start Date/Time Fields */}
                          <Stack>
                            <DateTimeFields
                              date={{
                                dateLabel: 'Start Date',
                                dateName: `sample_periods[${index}].start_date`,
                                dateId: `start_date_${index}`,
                                dateRequired: true,
                                dateIcon: mdiCalendarMonthOutline
                              }}
                              time={{
                                timeLabel: '',
                                timeName: `sample_periods[${index}].start_time`,
                                timeId: `start_time_${index}`,
                                timeRequired: false,
                                timeIcon: mdiClockOutline
                              }}
                              formikProps={formikProps}
                            />
                          </Stack>

                          {/* Arrow Separator */}
                          <Box flex="0 0 auto" mt={2.25}>
                            <Icon path={mdiArrowRightThin} size={1} />
                          </Box>

                          {/* End Date/Time Fields */}
                          <Stack>
                            <DateTimeFields
                              date={{
                                dateLabel: 'End Date',
                                dateName: `sample_periods[${index}].end_date`,
                                dateId: `end_date_${index}`,
                                dateRequired: true,
                                dateIcon: mdiCalendarMonthOutline
                              }}
                              time={{
                                timeLabel: '',
                                timeName: `sample_periods[${index}].end_time`,
                                timeId: `end_time_${index}`,
                                timeRequired: false,
                                timeIcon: mdiClockOutline
                              }}
                              formikProps={formikProps}
                            />
                          </Stack>

                          {/* Remove Button */}
                          <IconButton onClick={() => arrayHelpers.remove(index)}>
                            <Icon path={mdiClose} size={1} />
                          </IconButton>
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  </Collapse>
                ))}
              </TransitionGroup>
            </Timeline>

            {/* Add Period Button */}
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
                arrayHelpers.push({
                  id: `new_${values.sample_periods.length}`,
                  start_date: '',
                  start_time: '',
                  end_date: '',
                  end_time: ''
                });
              }}>
              Add Period
            </Button>
          </>
        )}
      />
    </form>
  );
};
