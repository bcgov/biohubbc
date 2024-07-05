import { mdiCalendar } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const DeviceDetailsInitialValues = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    progress_id: null,
    survey_types: [],
    revision_count: 0
  },
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  }
};

export const DeviceDetailsYupSchema = () => yup.object();

interface IDeploymentTimelineFormProps {
  captures: ICaptureResponse[];
  mortality: IMortalityResponse | undefined;
}

// Types to know how the deployment ended, determining which form components to display
type DeploymentEndType = 'capture' | 'mortality' | 'fall';

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const DeploymentTimelineForm = (props: IDeploymentTimelineFormProps) => {
  const formikProps = useFormikContext<ICreateAnimalDeployment>();
  const { values, setFieldValue } = formikProps;

  const surveyContext = useSurveyContext();

  const [deploymentEndType, setDeploymentEndType] = useState<DeploymentEndType | null>(null);

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
    <>
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
            options={props.captures.map((capture) => ({
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
            If the deployment ended due to a mortality, you must&nbsp;
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
            &nbsp;before removing the device
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
              disabled={!props.mortality}
              label="Mortality"
              onClick={() => {
                if (props.mortality) {
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
                <Stack direction={{ xs: 'column', md: 'row' }} mt={5} gap={3} alignItems="center" width="100%">
                  {deploymentEndType === 'capture' && (
                    <AutocompleteField
                      name="critterbase_end_capture_id"
                      id="critterbase_end_capture_id"
                      label={'End capture event'}
                      options={props.captures.map((capture) => ({
                        value: capture.capture_id,
                        label: dayjs(capture.capture_date).format(DATE_FORMAT.LongDateTimeFormat)
                      }))}
                      sx={{ width: '100%' }}
                    />
                  )}
                  {deploymentEndType === 'fall' && (
                    <Box sx={{ width: '100%' }}>
                      <DateTimeFields
                        formikProps={formikProps}
                        date={{
                          dateLabel: 'Date',
                          dateName: 'attachment_end_date',
                          dateId: 'attachment_end_date',
                          dateRequired: false,
                          dateIcon: mdiCalendar
                        }}
                        time={{
                          timeLabel: 'Time',
                          timeName: 'attachment_end_time',
                          timeId: 'attachment_end_time',
                          timeRequired: false,
                          timeIcon: mdiCalendar
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Collapse>
            )}
          </TransitionGroup>
        </Grid>
      </Grid>
    </>
  );
};

export default DeploymentTimelineForm;
