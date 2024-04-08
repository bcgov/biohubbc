import { mdiArrowRightThin, mdiCalendarMonthOutline, mdiClockOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { CodesContext } from 'contexts/codesContext';
import { default as dayjs } from 'dayjs';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useContext, useEffect } from 'react';
import yup from 'utils/YupSchema';

export interface ISurveySampleMethodPeriodData {
  survey_sample_period_id: number | null;
  survey_sample_method_id: number | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

export interface ISurveySampleMethodData {
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_lookup_id: number | null;
  description: string;
  periods: ISurveySampleMethodPeriodData[];
  method_response_metric_id: number | null;
}

export interface IEditSurveySampleMethodData extends ISurveySampleMethodData {
  index: number;
}

export const SurveySampleMethodPeriodArrayItemInitialValues = {
  method_lookup_id: null,
  survey_sample_period_id: null,
  survey_sample_method_id: null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

export const SurveySampleMethodDataInitialValues = {
  survey_sample_method_id: null,
  survey_sample_site_id: null,
  method_lookup_id: null,
  description: '',
  periods: [SurveySampleMethodPeriodArrayItemInitialValues],
  method_response_metric_id: '' as unknown as null
};

export const SamplingSiteMethodYupSchema = yup.object({
  method_lookup_id: yup.number().typeError('Method is required').required('Method is required'),
  method_response_metric_id: yup
    .number()
    .typeError('Response Metric is required')
    .required('Response Metric is required'),
  description: yup.string().max(250, 'Maximum 250 characters'),
  periods: yup
    .array(
      yup
        .object({
          start_date: yup
            .string()
            .typeError('Start Date is required')
            .isValidDateString()
            .required('Start Date is required'),
          end_date: yup
            .string()
            .typeError('End Date is required')
            .isValidDateString()
            .required('End Date is required')
            .isEndDateSameOrAfterStartDate('start_date'),
          start_time: yup.string().when('end_time', {
            is: (val: string | null) => val && val !== null,
            then: yup.string().typeError('Start Time is required').required('Start Time is required'),
            otherwise: yup.string().nullable()
          }),
          end_time: yup.string().nullable()
        })
        .test('checkDatesAreSameAndEndTimeIsAfterStart', 'Start and End dates must be different', function (value) {
          const { start_date, end_date, start_time, end_time } = value;

          if (start_date === end_date && start_time && end_time) {
            return dayjs(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
              dayjs(`${end_date} ${end_time}`, 'YYYY-MM-DD HH:mm:ss')
            );
          }
          return true;
        })
    )
    .hasUniqueDateRanges('Periods cannot overlap', 'start_date', 'end_date')
    .min(1, 'At least one time period is required')
});

const MethodForm = () => {
  const formikProps = useFormikContext<ISurveySampleMethodData>();
  const { values, errors } = formikProps;

  const codesContext = useContext(CodesContext);

  const methodResponseMetricOptions: ISelectWithSubtextFieldOption[] =
    codesContext.codesDataLoader.data?.method_response_metrics.map((option) => ({
      value: option.id,
      label: option.name,
      subText: option.description
    })) ?? [];

  const methodOptions: ISelectWithSubtextFieldOption[] =
    codesContext.codesDataLoader.data?.sample_methods.map((option) => ({
      value: option.id,
      label: option.name,
      subText: option.description
    })) ?? [];

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form>
      <Stack gap={3} width={900}>
        <Stack component="fieldset" gap={3}>
          <Typography component="legend">Details</Typography>
          <SelectWithSubtextField
            id="method_lookup_id"
            label="Sampling Method"
            name="method_lookup_id"
            options={methodOptions}
            required
          />
          <SelectWithSubtextField
            id="method_response_metric_id"
            label="Response Metric"
            name="method_response_metric_id"
            options={methodResponseMetricOptions}
            required
          />
          <CustomTextField
            name="description"
            label="Description of method"
            maxLength={250}
            other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
          />
        </Stack>

        <Box component="fieldset">
          <Typography
            component="legend"
            id="time_periods"
            sx={{
              mb: 1
            }}>
            Periods
          </Typography>
          <Box>
            <FieldArray
              name="periods"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <Box>
                  {errors.periods && typeof errors.periods === 'string' && (
                    <Alert severity="error" sx={{ mb: 2.5 }}>
                      {String(errors.periods)}
                    </Alert>
                  )}

                  <Stack
                    component={List}
                    gap={1}
                    sx={{
                      mt: -1,
                      p: 0
                    }}>
                    {values.periods.map((period, index) => {
                      return (
                        <ListItem
                          disableGutters
                          divider
                          key={`sample_period_${index}_${period.start_date}-${period.end_date}`}
                          sx={{
                            pt: 1.5,
                            pb: 2
                          }}>
                          <Stack alignItems="flex-start" flexDirection="row" gap={1}>
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
                                    dateName: `periods[${index}].start_date`,
                                    dateId: `periods_${index}_.start_date`,
                                    dateRequired: true,
                                    dateIcon: mdiCalendarMonthOutline
                                  }}
                                  time={{
                                    timeLabel: '',
                                    timeName: `periods[${index}].start_time`,
                                    timeId: `periods_${index}_.start_time`,
                                    timeRequired: false,
                                    timeIcon: mdiClockOutline
                                  }}
                                  parentName={`periods[${index}]`}
                                  formikProps={formikProps}
                                />
                                {errors.periods &&
                                  typeof errors.periods !== 'string' &&
                                  errors.periods[index] &&
                                  typeof errors.periods[index] === 'string' && (
                                    <Typography
                                      variant="caption"
                                      color="error"
                                      sx={{
                                        mt: '3px',
                                        ml: '14px'
                                      }}>
                                      {String(errors.periods[index])}
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
                                    dateName: `periods[${index}].end_date`,
                                    dateId: `periods_${index}_.end_date`,
                                    dateRequired: true,
                                    dateIcon: mdiCalendarMonthOutline
                                  }}
                                  time={{
                                    timeLabel: '',
                                    timeName: `periods[${index}].end_time`,
                                    timeId: `periods_${index}_.end_time`,
                                    timeRequired: false,
                                    timeIcon: mdiClockOutline
                                  }}
                                  parentName={`periods[${index}]`}
                                  formikProps={formikProps}
                                />
                                {errors.periods &&
                                  typeof errors.periods !== 'string' &&
                                  errors.periods[index] &&
                                  typeof errors.periods[index] === 'string' && (
                                    <Typography
                                      variant="caption"
                                      color="error"
                                      sx={{
                                        mt: '3px',
                                        ml: '14px'
                                      }}>
                                      {String(errors.periods[index])}
                                    </Typography>
                                  )}
                              </Stack>
                            </Stack>
                            <IconButton
                              sx={{ mt: 1 }}
                              data-testid="delete-icon"
                              aria-label="remove time period"
                              onClick={() => arrayHelpers.remove(index)}>
                              <Icon path={mdiTrashCanOutline} size={1} />
                            </IconButton>
                          </Stack>
                        </ListItem>
                      );
                    })}
                  </Stack>

                  <Button
                    sx={{
                      alignSelf: 'flex-start',
                      mt: 1
                    }}
                    data-testid="sampling-period-add-button"
                    variant="outlined"
                    color="primary"
                    title="Add Period"
                    aria-label="Create Sample Period"
                    startIcon={<Icon path={mdiPlus} size={1} />}
                    onClick={() => arrayHelpers.push(SurveySampleMethodPeriodArrayItemInitialValues)}>
                    Add Time Period
                  </Button>
                </Box>
              )}
            />
          </Box>
        </Box>
      </Stack>
    </form>
  );
};

export default MethodForm;
