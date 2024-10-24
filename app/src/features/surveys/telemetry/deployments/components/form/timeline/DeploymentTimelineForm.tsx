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

export const DeploymentTimelineFormInitialValues: yup.InferType<typeof DeploymentTimelineFormYupSchema> = {
  critterbase_start_capture_id: null as unknown as string,
  critterbase_end_mortality_id: null,
  critterbase_end_capture_id: null,
  attachment_end_date: null,
  attachment_end_time: null
};

export const DeploymentTimelineFormYupSchema = yup.object({
  critterbase_start_capture_id: yup.string().nullable().required('You must select the initial capture event'),
  critterbase_end_mortality_id: yup.string().uuid().nullable(),
  critterbase_end_capture_id: yup.string().uuid().nullable(),
  attachment_end_date: yup.lazy(() =>
    yup
      .string()
      .nullable()
      .when('attachment_end_time', {
        is: (attachment_end_time: string | null) => attachment_end_time !== null,
        then: yup.string().nullable().required('End Date is required'),
        otherwise: yup.string().nullable()
      })
  ),
  attachment_end_time: yup.lazy(() =>
    yup
      .string()
      .nullable()
      .when('attachment_end_date', {
        is: (attachment_end_date: string | null) => attachment_end_date !== null,
        then: yup.string().nullable().required('End time is required'),
        otherwise: yup.string().nullable()
      })
  )
});

interface IDeploymentTimelineFormProps {
  captures: ICaptureResponse[];
  mortalities: IMortalityResponse[];
}

/**
 * Deployment form - deployment timeline section.
 *
 * @param {IDeploymentTimelineFormProps} props
 * @return {*}
 */
export const DeploymentTimelineForm = (props: IDeploymentTimelineFormProps) => {
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
      <Grid item xs={12}>
        <Typography component="legend" variant="h5">
          Start of deployment
        </Typography>
        <Typography color="textSecondary" mb={3}>
          You must&nbsp;
          {values.critter_id ? (
            <Typography
              sx={{
                textDecoration: 'none'
              }}
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/${values.critter_id}/capture/create`}>
              add the capture
            </Typography>
          ) : (
            'add the capture'
          )}
          &nbsp;during which the device was deployed before adding the deployment.
        </Typography>
        <AutocompleteField
          name="critterbase_start_capture_id"
          id="critterbase_start_capture_id"
          label={'Initial capture event'}
          options={captures.map((capture) => ({
            value: capture.capture_id,
            label: dayjs(capture.capture_date).format(DATE_FORMAT.LongDateTimeFormat)
          }))}
          required
        />
      </Grid>

      <Grid item xs={12} mt={3} flex="1 1 auto">
        <Typography component="legend" variant="h5">
          End of deployment (optional)
        </Typography>
        <Typography color="textSecondary" mb={3}>
          Select how the deployment ended. If due to a mortality, you must&nbsp;
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
            disabled={!mortalities.length}
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
                  options={captures.map((capture) => ({
                    value: capture.capture_id,
                    label: dayjs(capture.capture_date).format(DATE_FORMAT.LongDateTimeFormat)
                  }))}
                  sx={{ width: '100%' }}
                />
              )}
              {deploymentEndType === 'fell_off' && (
                <Box sx={{ width: '100%' }} display="flex">
                  <DateField
                    id="attachment_end_date"
                    name="attachment_end_date"
                    label="End date"
                    required={values.attachment_end_time !== null}
                    formikProps={formikProps}
                  />
                  <TimeField
                    id="attachment_end_time"
                    name="attachment_end_time"
                    label="End time"
                    required={values.attachment_end_date !== null}
                    formikProps={formikProps}
                  />
                </Box>
              )}
              {deploymentEndType === 'mortality' && (
                <Box sx={{ width: '100%' }} display="flex">
                  <AutocompleteField
                    name="critterbase_end_mortality_id"
                    id="critterbase_end_mortality_id"
                    label={'End mortality event'}
                    options={mortalities.map((mortality) => ({
                      value: mortality.mortality_id,
                      label: dayjs(mortality.mortality_timestamp).format(DATE_FORMAT.LongDateTimeFormat)
                    }))}
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
