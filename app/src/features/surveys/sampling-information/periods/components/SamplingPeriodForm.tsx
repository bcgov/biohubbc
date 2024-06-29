import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { ISurveySampleMethodPeriodData } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { useFormikContext } from 'formik';

export const SamplingPeriodForm = () => {
  const formikProps = useFormikContext<ISurveySampleMethodPeriodData>();

  const { errors } = formikProps;

  return (
    <form>
      <Box component="fieldset">
        {/* <Box> */}
        {/* <FieldArray
          name="sample_periods"
          render={(arrayHelpers: FieldArrayRenderProps) => ( */}
        <Box>
          <Stack
            flexDirection="row"
            gap={1}
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
                  //   dateError: get(errors, 'sample_periods'),
                  //   dateHelperText: get(errors, 'sample_periods')
                }}
                time={{
                  timeLabel: '',
                  timeName: `start_time`,
                  timeId: `start_time`,
                  timeRequired: false,
                  timeIcon: mdiClockOutline
                  //   dateError: get(errors, 'sample_periods'),
                  //   dateHelperText: get(errors, 'sample_periods')
                }}
                // parentName={`sample_periods`}
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
                // parentName={`sample_periods`}
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
          </Stack>
        </Box>
        {/* )}
        /> */}
        {/* </Box> */}
      </Box>
    </form>
  );
};
