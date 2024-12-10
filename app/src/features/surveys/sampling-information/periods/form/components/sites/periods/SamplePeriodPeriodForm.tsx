import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline, mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { TransitionGroup } from 'react-transition-group';

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

export const InitialSurveySamplePeriodValues: ISurveySampleMethodPeriodData = {
  survey_sample_period_id: null,
  survey_sample_method_id: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

interface ISamplePeriodPeriodFormProps {
  index: number;
  formikFieldName: string;
  samplePeriods: ISurveySampleMethodPeriodData[];
  handleRemove?: (index: number) => void;
}

export const SamplePeriodPeriodForm = (props: ISamplePeriodPeriodFormProps) => {
  const { samplePeriods, handleRemove } = props;

  const formikProps = useFormikContext<ICreateSamplingPeriodRequest>();

  return (
    <form>
      <TransitionGroup>
        {samplePeriods.map((period, index) => (
          <Collapse key={period.id}>
            <Box
              component={Stack}
              flexDirection="row"
              alignItems="center"
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
                    dateName: `${props.formikFieldName}.[${index}].start_date`,
                    dateId: `start_date_${index}`,
                    dateRequired: true,
                    dateIcon: mdiCalendarMonthOutline
                  }}
                  time={{
                    timeLabel: '',
                    timeName: `${props.formikFieldName}.[${index}].start_time`,
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
                    dateName: `${props.formikFieldName}.[${index}].end_date`,
                    dateId: `end_date_${index}`,
                    dateRequired: true,
                    dateIcon: mdiCalendarMonthOutline
                  }}
                  time={{
                    timeLabel: '',
                    timeName: `${props.formikFieldName}.[${index}].end_time`,
                    timeId: `end_time_${index}`,
                    timeRequired: false,
                    timeIcon: mdiClockOutline
                  }}
                  formikProps={formikProps}
                />
              </Stack>

              {/* Remove Button */}
              {handleRemove && (
                <Box>
                  <IconButton onClick={() => handleRemove(index)}>
                    <Icon path={mdiClose} size={1} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </form>
  );
};
