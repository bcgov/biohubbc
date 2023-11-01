import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import StartEndTimeFields from 'components/fields/StartEndTimeFields';
import { CodesContext } from 'contexts/codesContext';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import get from 'lodash-es/get';
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
        end_time: yup.string().nullable()
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
              <>
                <List disablePadding>
                  {values.periods.map((period, index) => {
                    return (
                      <ListItem
                        alignItems="flex-start"
                        disableGutters
                        key={`sample_period_${period.start_date}-${period.end_date}`}
                        sx={{
                          '& .MuiListItemSecondaryAction-root': {
                            top: '36px'
                          }
                        }}>
                        <Box width="100%">
                          <Box width="100%">
                            <StartEndDateFields
                              formikProps={formikProps}
                              startName={`periods[${index}].start_date`}
                              endName={`periods[${index}].end_date`}
                              startRequired={true}
                              endRequired={true}
                            />
                          </Box>

                          <Box width="100%" pt={1}>
                            <StartEndTimeFields
                              formikProps={formikProps}
                              startName={`periods[${index}].start_time`}
                              endName={`periods[${index}].end_time`}
                              startRequired={false}
                              endRequired={false}
                            />
                          </Box>
                        </Box>
                        <ListItemSecondaryAction
                          sx={{
                            flex: '0 0 auto'
                          }}>
                          <IconButton
                            data-testid="delete-icon"
                            aria-label="remove time period"
                            onClick={() => arrayHelpers.remove(index)}>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
                {errors.periods && !Array.isArray(errors.periods) && (
                  <Box pt={2}>
                    <Typography variant="body2" color={'#f44336'}>
                      {errors.periods}
                    </Typography>
                  </Box>
                )}

                <Button
                  sx={{
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
              </>
            )}
          />
        </Box>
      </Box>
    </form>
  );
};

export default MethodForm;
