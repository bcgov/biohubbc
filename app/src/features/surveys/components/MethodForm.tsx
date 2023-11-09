import {
  mdiArrowRight,
  mdiCalendarEnd,
  mdiCalendarStart,
  mdiClockOutline,
  mdiClockTimeOneOutline,
  mdiPlus,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { CodesContext } from 'contexts/codesContext';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import get from 'lodash-es/get';
import moment from 'moment';
import { useContext, useEffect } from 'react';
import yup from 'utils/YupSchema';

interface ISurveySampleMethodPeriodData {
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
}

export interface IEditSurveySampleMethodData extends ISurveySampleMethodData {
  index: number;
}

export const SurveySampleMethodPeriodArrayItemInitialValues = {
  method_lookup_id: '' as unknown as null,
  survey_sample_period_id: '' as unknown as null,
  survey_sample_method_id: '' as unknown as null,
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: ''
};

export const SurveySampleMethodDataInitialValues = {
  survey_sample_method_id: '' as unknown as null,
  survey_sample_site_id: '' as unknown as null,
  method_lookup_id: '' as unknown as null,
  description: '',
  periods: [SurveySampleMethodPeriodArrayItemInitialValues]
};

export const SamplingSiteMethodYupSchema = yup.object({
  method_lookup_id: yup.number().typeError('Method is required').required('Method is required'),
  description: yup.string().max(250, 'Maximum 250 characters'),
  periods: yup
    .array(
      yup.object({
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
        start_time: yup.string().nullable(),
        end_time: yup
          .string()
          .nullable()
          .test('checkDatesAreSameAndEndTimeIsAfterStart', 'End time must be after Start time', function (value) {
            const { start_date, end_date, start_time } = this.parent;
            if (start_date === end_date && start_time && value) {
              const val = moment(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
                moment(`${end_date} ${value}`, 'YYYY-MM-DD HH:mm:ss')
              );
              return val;
            }
            return true;
          })
      })
    )
    .hasUniqueDateRanges('Periods cannot overlap', 'start_date', 'end_date')
    .min(1, 'At least one time period is required')
});

const MethodForm = () => {
  const formikProps = useFormikContext<ISurveySampleMethodData>();
  const { values, errors, touched, handleChange } = formikProps;

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <form>
      <Box component={'fieldset'} mb={3}>
        <FormControl
          fullWidth
          variant="outlined"
          required={true}
          error={get(touched, 'method_lookup_id') && Boolean(get(errors, 'method_lookup_id'))}
          style={{ width: '100%' }}>
          <InputLabel id={'method_lookup_id-label'}>Method Type</InputLabel>
          <Select
            name={'method_lookup_id'}
            labelId={'method_lookup_id-label'}
            label={'Method Type'}
            value={values.method_lookup_id}
            displayEmpty
            inputProps={{ id: 'method_lookup_id', 'aria-label': 'Method Type' }}
            onChange={handleChange}
            sx={{ width: '100%', backgroundColor: '#fff' }}>
            {codesContext.codesDataLoader.data.sample_methods.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{get(touched, 'method_lookup_id') && get(errors, 'method_lookup_id')}</FormHelperText>
        </FormControl>
      </Box>
      <Box mb={3}>
        <CustomTextField
          name="description"
          label="Description"
          maxLength={250}
          other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
        />
      </Box>

      <Box component="fieldset">
        <Typography
          component="legend"
          id="time_periods"
          sx={{
            mb: 1
          }}>
          Time Periods
        </Typography>
        <Box>
          <FieldArray
            name="periods"
            render={(arrayHelpers: FieldArrayRenderProps) => (
              <Stack alignItems="flex-start">
                
                <Stack component={List} gap={1}
                  sx={{
                    mt: -1,
                    p: 0
                  }}
                >
                  {values.periods.map((period, index) => {
                    return (
                      <ListItem
                        disableGutters
                        divider
                        key={`sample_period_${period.start_date}-${period.end_date}`}
                        sx={{
                          pt: 1.5,
                          pb: 2
                        }}>
                        
                        <Stack alignItems="flex-start" flexDirection="row" gap={1}>
                          <Stack flexDirection="row" gap={1}
                            sx={{
                              '& .MuiFormHelperText-root': {
                                mb: -0.75
                              }
                            }}
                          >
                          
                            <DateTimeFields
                              date={{
                                dateLabel: 'Start Date',
                                dateName: `periods[${index}].start_date`,
                                dateId: String(index),
                                dateRequired: true,
                                dateHelperText: '',
                                dateIcon: mdiCalendarStart
                              }}
                              time={{
                                timeLabel: '',
                                timeName: `periods[${index}].start_time`,
                                timeId: String(index),
                                timeRequired: false,
                                timeHelperText: '',
                                timeIcon: mdiClockOutline
                              }}
                              formikProps={formikProps}
                            />

                            <Box flex="0 0 auto" mt={2.25}>
                              <Icon path={mdiArrowRight} size={0.8} />
                            </Box>

                            <DateTimeFields
                              date={{
                                dateLabel: 'End Date',
                                dateName: `periods[${index}].end_date`,
                                dateId: String(index),
                                dateRequired: true,
                                dateHelperText: '',
                                dateIcon: mdiCalendarEnd
                              }}
                              time={{
                                timeLabel: '',
                                timeName: `periods[${index}].end_time`,
                                timeId: String(index),
                                timeRequired: false,
                                timeHelperText: '',
                                timeIcon: mdiClockOutline
                              }}
                              formikProps={formikProps}
                            />
                          </Stack>
                          <IconButton
                            sx={{mt: 1 }}
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
                {errors.periods && !Array.isArray(errors.periods) && (
                  <Box pt={2}>
                    <Typography variant="body2" color={'#f44336'}>
                      {errors.periods}
                    </Typography>
                  </Box>
                )}

                <Button
                  sx={{mt: 1}}
                  data-testid="sampling-period-add-button"
                  variant="outlined"
                  color="primary"
                  title="Add Period"
                  aria-label="Create Sample Period"
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={() => arrayHelpers.push(SurveySampleMethodPeriodArrayItemInitialValues)}>
                  Add Time Period
                </Button>

              </Stack>
            )}
          />
        </Box>
      </Box>
    </form>
  );
};

export default MethodForm;
