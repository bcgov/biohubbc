import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import { DateField } from 'components/fields/DateField';
import { TimeField } from 'components/fields/TimeField';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

// Types to know how the deployment ended, determining which form components to display
type DeploymentEndType = 'capture' | 'mortality' | 'fell_off';

export const DeploymentEndFormInitialValues: yup.InferType<typeof DeploymentEndFormYupSchema> = {
  attachment_end_date: null,
  attachment_end_time: null,
  critterbase_end_mortality_id: null,
  critterbase_end_capture_id: null
};

export const DeploymentEndFormYupSchema = yup.object({
  attachment_end_date: yup.lazy(() =>
    yup
      .string()
      .nullable()
      .default(null)
      .when('attachment_end_time', {
        is: (attachment_end_time: string | null) => attachment_end_time !== null,
        then: yup.string().nullable().required('End date is required'),
        otherwise: yup.string().nullable().default(null)
      })
  ),
  attachment_end_time: yup.string().nullable().default(null),
  critterbase_end_mortality_id: yup.string().uuid().nullable().default(null),
  critterbase_end_capture_id: yup.string().uuid().nullable().default(null)
});

interface IDeploymentEndFormProps {
  captures: ICaptureResponse[];
  mortalities: IMortalityResponse[];
}

/**
 * Deployment form - end of deployment details
 *
 * @param {IDeploymentEndFormProps} props
 * @return {*}
 */
export const DeploymentEndForm = (props: IDeploymentEndFormProps) => {
  const { captures, mortalities } = props;

  const formikProps = useFormikContext<ICreateAnimalDeployment>();

  const { values, setFieldValue } = formikProps;

  // Determine the initial deployment end type based on the form values
  const initialDeploymentEndType = useMemo(() => {
    if (values.critterbase_end_mortality_id) {
      return 'mortality';
    } else if (values.critterbase_end_capture_id) {
      return 'capture';
    } else if (values.attachment_end_date) {
      return 'fell_off';
    } else {
      return null;
    }
  }, [values]);

  const [deploymentEndType, setDeploymentEndType] = useState<DeploymentEndType | null>(initialDeploymentEndType);

  const surveyContext = useSurveyContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} flex="1 1 auto">
        <Typography color="textSecondary" mb={2}>
          If applicable, select how the deployment ended. If due to a mortality, you must&nbsp;
          {values.critter_id ? (
            <Typography
              sx={{
                textDecoration: 'none'
              }}
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/${values.critter_id}/mortality/create`}>
              report the mortality
            </Typography>
          ) : (
            'report the mortality'
          )}
          &nbsp;before removing the device.
        </Typography>

        <RadioGroup
          aria-label="deployment-end"
          value={deploymentEndType}
          sx={{ '& .MuiFormControlLabel-root': { cursor: 'default' } }}>
          <FormControlLabel
            value="fell_off"
            control={<Radio color="primary" />}
            label="Fell off"
            onChange={() => {
              setDeploymentEndType('fell_off');
              setFieldValue('critterbase_end_capture_id', null);
              setFieldValue('critterbase_end_mortality_id', null);
            }}
            onClick={() => {
              if (deploymentEndType === 'fell_off') {
                // if the user clicks on the selected radio button, unselect it
                setDeploymentEndType(null);
                setFieldValue('attachment_end_date', null);
                setFieldValue('attachment_end_time', null);
                setFieldValue('critterbase_end_capture_id', null);
                setFieldValue('critterbase_end_mortality_id', null);
              }
            }}
          />
          <FormControlLabel
            value="capture"
            control={<Radio color="primary" />}
            label="Capture"
            onChange={() => {
              setDeploymentEndType('capture');
              setFieldValue('attachment_end_date', null);
              setFieldValue('attachment_end_time', null);
              setFieldValue('critterbase_end_mortality_id', null);
            }}
            onClick={() => {
              if (deploymentEndType === 'capture') {
                // if the user clicks on the selected radio button, unselect it
                setDeploymentEndType(null);
                setFieldValue('attachment_end_date', null);
                setFieldValue('attachment_end_time', null);
                setFieldValue('critterbase_end_capture_id', null);
                setFieldValue('critterbase_end_mortality_id', null);
              }
            }}
          />
          <FormControlLabel
            value="mortality"
            control={<Radio color="primary" />}
            label="Mortality"
            onChange={() => {
              setDeploymentEndType('mortality');
              setFieldValue('attachment_end_date', null);
              setFieldValue('attachment_end_time', null);
              setFieldValue('critterbase_end_capture_id', null);
            }}
            onClick={() => {
              if (deploymentEndType === 'mortality') {
                // if the user clicks on the selected radio button, unselect it
                setDeploymentEndType(null);
                setFieldValue('attachment_end_date', null);
                setFieldValue('attachment_end_time', null);
                setFieldValue('critterbase_end_capture_id', null);
                setFieldValue('critterbase_end_mortality_id', null);
              }
            }}
          />
        </RadioGroup>

        <TransitionGroup>
          <Collapse>
            <Stack direction={{ xs: 'column', md: 'row' }} mt={3} gap={3} alignItems="center" width="100%">
              {deploymentEndType === 'capture' && (
                <AutocompleteField
                  name="critterbase_end_capture_id"
                  id="critterbase_end_capture_id"
                  label={'End capture event'}
                  onChange={(_, option) => {
                    if (option?.value) {
                      setFieldValue('critterbase_end_capture_id', option.value);
                    }
                  }}
                  options={captures.map((capture) => {
                    const hasTime = !!capture.capture_time;
                    let showTime = false;
                    let formattedLabel = '';
                    if (hasTime) {
                      const time = dayjs(capture.capture_time, ['HH:mm', 'HH:mm:ss', 'h:mm A']);
                      if (time.format('HH:mm') !== '00:00' && time.format('h:mm A') !== '12:00 AM') {
                        showTime = true;
                      }
                    }
                    if (showTime) {
                      formattedLabel = dayjs(`${capture.capture_date} ${capture.capture_time}`).format(
                        DATE_FORMAT.LongDateTimeFormat
                      );
                    } else {
                      formattedLabel = dayjs(`${capture.capture_date}`).format(DATE_FORMAT.MediumDateFormat);
                    }
                    return {
                      value: capture.capture_id,
                      label: formattedLabel
                    };
                  })}
                  sx={{ width: '100%' }}
                />
              )}
              {deploymentEndType === 'fell_off' && (
                <Box sx={{ width: '100%' }} display="flex">
                  <DateField
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0
                      }
                    }}
                    id="attachment_end_date"
                    name="attachment_end_date"
                    label="End date"
                    required={values.attachment_end_time !== null}
                  />
                  <TimeField
                    id="attachment_end_time"
                    name="attachment_end_time"
                    label="End time"
                    required={values.attachment_end_date !== null}
                  />
                </Box>
              )}
              {deploymentEndType === 'mortality' && (
                <Box sx={{ width: '100%' }} display="flex">
                  <AutocompleteField
                    name="critterbase_end_mortality_id"
                    id="critterbase_end_mortality_id"
                    label={'End mortality event'}
                    options={mortalities.map((mortality) => {
                      // TODO: TECH DEBT: We currently assume that a time value of 00:00 (midnight) means the time is null/missing, and do not display it in dropdowns. However, a user could intentionally set 00:00 as a valid time. This logic should be revisited in the future to properly distinguish between a true null and a valid midnight time.
                      const dt = dayjs(mortality.mortality_timestamp);
                      const isMidnight = dt.format('HH:mm') === '00:00' || dt.format('h:mm A') === '12:00 AM';
                      const formattedLabel = isMidnight
                        ? dt.format(DATE_FORMAT.MediumDateFormat)
                        : dt.format(DATE_FORMAT.LongDateTimeFormat);
                      return {
                        value: mortality.mortality_id,
                        label: formattedLabel
                      };
                    })}
                    sx={{ width: '100%' }}
                  />
                </Box>
              )}
            </Stack>
          </Collapse>
        </TransitionGroup>
      </Grid>
    </Grid>
  );
};
