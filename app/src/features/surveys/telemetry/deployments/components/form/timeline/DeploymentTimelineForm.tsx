import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { DateField } from 'components/fields/DateField';
import { TimeField } from 'components/fields/TimeField';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Field, useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { SyntheticEvent, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

const validateDeploymentEnd = async (value: string, deploymentEndType: DeploymentEndType | null) => {
  if (deploymentEndType === 'capture' && !value) {
    return 'Must select the capture when the deployment ended';
  }
  if (deploymentEndType === 'mortality' && !value) {
    return 'Must select the mortality when the deployment ended';
  }
  if (deploymentEndType === 'fall' && !value) {
    return 'Must select the date for when the deployment ended';
  }
};

// Types to know how the deployment ended, determining which form components to display
type DeploymentEndType = 'capture' | 'mortality' | 'fall';

interface IDeploymentTimelineFormProps {
  captures: ICaptureResponse[];
  mortality: IMortalityResponse | undefined;
}

export const DeploymentTimelineFormYupSchema = yup.object({
  critterbase_start_capture_id: yup.string().required('You must select the initial capture event'),
  critterbase_end_mortality_id: yup.string().uuid().nullable(),
  critterbase_end_capture_id: yup.string().uuid().nullable(),
  attachment_end_date: yup.string().nullable(),
  attachment_end_time: yup.string().nullable()
});

/**
 * Deployment form - deployment timeline section.
 *
 * @param {IDeploymentTimelineFormProps} props
 * @return {*}
 */
export const DeploymentTimelineForm = (props: IDeploymentTimelineFormProps) => {
  const { captures, mortality } = props;

  const formikProps = useFormikContext<ICreateAnimalDeployment>();

  const { values, setFieldValue } = formikProps;

  console.log(values);

  // Determine deploymentEndType based on values
  const initialDeploymentEndType = useMemo(() => {
    if (values.critterbase_end_mortality_id) {
      return 'mortality';
    } else if (values.critterbase_end_capture_id) {
      return 'capture';
    } else if (values.attachment_end_date) {
      return 'fall';
    } else {
      return null;
    }
  }, [values]);

  const [deploymentEndType, setDeploymentEndType] = useState<DeploymentEndType | null>(initialDeploymentEndType);

  const surveyContext = useSurveyContext();

  // Using onChange in the RadioGroup does not allow the value to be unset
  // As a workaround, set the value through onClick events within each RadioButton separately
  const handleRadioButtonClick = (value: DeploymentEndType) => {
    if (value === deploymentEndType) {
      setDeploymentEndType(null);
    } else {
      setDeploymentEndType(value);
    }
  };

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
            value="fall"
            control={<Radio color="primary" />}
            label="Fell off"
            onClick={() => {
              handleRadioButtonClick('fall');
              setFieldValue('critterbase_end_mortality_id', null);
              setFieldValue('critterbase_end_capture_id', null);
            }}
          />
          <FormControlLabel
            value="capture"
            control={<Radio color="primary" />}
            label="Capture"
            onClick={() => {
              handleRadioButtonClick('capture');
              setFieldValue('critterbase_end_mortality_id', null);
              setFieldValue('attachment_end_date', null);
              setFieldValue('attachment_end_time', null);
            }}
          />
          <FormControlLabel
            value="mortality"
            control={<Radio color="primary" />}
            disabled={!mortality}
            label="Mortality"
            onClick={() => {
              if (mortality) {
                handleRadioButtonClick('mortality');
                setFieldValue('critterbase_end_capture_id', null);
                setFieldValue('attachment_end_date', null);
                setFieldValue('attachment_end_time', null);
              }
            }}
          />
        </RadioGroup>

        <TransitionGroup>
          {deploymentEndType && (
            <Collapse>
              <Stack direction={{ xs: 'column', md: 'row' }} mt={3} gap={3} alignItems="center" width="100%">
                {deploymentEndType === 'capture' && (
                  <Field
                    as={AutocompleteField}
                    formikProps={formikProps}
                    validate={(value: string) => validateDeploymentEnd(value, deploymentEndType)}
                    name="critterbase_end_capture_id"
                    id="critterbase_end_capture_id"
                    label={'End capture event'}
                    onChange={(_: SyntheticEvent<Element, Event>, option: IAutocompleteFieldOption<string>) => {
                      if (option.value) {
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
                {deploymentEndType === 'fall' && (
                  <Box sx={{ width: '100%' }} display="flex">
                    <Field
                      as={DateField}
                      name="attachment_end_date"
                      formikProps={formikProps}
                      validate={(value: string) => validateDeploymentEnd(value, deploymentEndType)}
                      label="End Date"
                    />
                    <Field as={TimeField} name="attachment_end_time" formikProps={formikProps} label="End time" />
                  </Box>
                )}
                {deploymentEndType === 'mortality' && (
                  <Box sx={{ width: '100%' }} display="flex">
                    <Field
                      as={AutocompleteField}
                      formikProps={formikProps}
                      validate={(value: string) => validateDeploymentEnd(value, deploymentEndType)}
                      name="critterbase_end_mortality_id"
                      id="critterbase_end_mortality_id"
                      label={'End mortality event'}
                      value={mortality}
                      options={[]}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                )}
              </Stack>
            </Collapse>
          )}
        </TransitionGroup>
      </Grid>
    </Grid>
  );
};
