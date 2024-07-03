import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { ICodeResponse } from 'hooks/telemetry/useDeviceApi';
import { useSurveyContext } from 'hooks/useContext';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import yup from 'utils/YupSchema';
import AnimalAutocompleteField from './components/AnimalAutocomplete';

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

interface IDeploymentDetailsFormProps {
  animals: ISimpleCritterWithInternalId[];
  setSelectedAnimal: React.Dispatch<SetStateAction<ISurveyCritter | undefined>>;
  frequencyUnits: ICodeResponse[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const DeploymentDetailsForm = (props: IDeploymentDetailsFormProps) => {
  const surveyContext = useSurveyContext();
  const { setFieldValue, values, errors } = useFormikContext<ICreateAnimalDeployment>();

  console.log(errors);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography color="textSecondary" mb={3}>
            You must&nbsp;
            <Typography
              sx={{
                textDecoration: 'none'
              }}
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/create`}>
              add the animal
            </Typography>
            &nbsp;to your Survey before associating it to a telemetry device. Add animals via the&nbsp;
            <Typography
              sx={{
                textDecoration: 'none'
              }}
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals`}>
              Manage Animals
            </Typography>
            &nbsp;page.
          </Typography>
          <CustomTextField
            name="device_id"
            label="Device ID"
            maxLength={200}
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AnimalAutocompleteField
            label="Animal"
            name="critter_id"
            required
            clearOnSelect
            handleAnimal={(animal: ISimpleCritterWithInternalId) => {
              setFieldValue('critter_id', animal.critter_id);
              props.setSelectedAnimal({
                survey_critter_id: animal.survey_critter_id,
                critterbase_critter_id: animal.critter_id
              });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" flex="1 1 auto">
            <TextField name="frequency" label="Device frequency" type="number" sx={{ flex: '1 1 auto' }} />
            <AutocompleteField
              sx={{ flex: 0.4 }}
              name="frequency_unit"
              id="frequency_unit"
              label={'Unit'}
              options={props.frequencyUnits.map((unit) => ({
                value: unit.code,
                label: unit.code
              }))}
              required={values.frequency ? true : false}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default DeploymentDetailsForm;
