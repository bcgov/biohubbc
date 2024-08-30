import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AnimalAutocompleteField } from 'components/fields/AnimalAutocompleteField';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { Link as RouterLink } from 'react-router-dom';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';

export const DeploymentDetailsFormInitialValues: yup.InferType<typeof DeploymentDetailsFormYupSchema> = {
  device_id: null as unknown as string,
  critter_id: null as unknown as number,
  frequency: null,
  frequency_unit: null
};

export const DeploymentDetailsFormYupSchema = yup.object({
  device_id: yup.string().nullable().required('You must enter the device ID. This is typically the serial number'),
  critter_id: yup.number().nullable().required('You must select the animal that the device is associated to'),
  frequency: yup.lazy(() =>
    yup
      .number()
      .nullable()
      .when('frequency_unit', {
        is: (frequency_unit: number) => isDefined(frequency_unit), // when frequency_unit is defined
        then: yup.number().nullable().required('Frequency is required')
      })
  ),
  frequency_unit: yup.lazy(() =>
    yup
      .number()
      .nullable()
      .when('frequency', {
        is: (frequency: number) => isDefined(frequency), // when frequency is defined
        then: yup.number().nullable().required('Frequency unit is required')
      })
  )
});

interface IDeploymentDetailsFormProps {
  surveyAnimals: ICritterSimpleResponse[];
  frequencyUnits: IAutocompleteFieldOption<number>[];
  isEdit?: boolean;
}

/**
 * Deployment form - deployment details section.
 *
 * @param {IDeploymentDetailsFormProps} props
 * @return {*}
 */
export const DeploymentDetailsForm = (props: IDeploymentDetailsFormProps) => {
  const { surveyAnimals, frequencyUnits, isEdit } = props;

  const { setFieldValue, values } = useFormikContext<ICreateAnimalDeployment>();

  const surveyContext = useSurveyContext();

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
              required: true,
              disabled: isEdit
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <AnimalAutocompleteField
            formikFieldName="critter_id"
            label="Animal"
            defaultAnimal={surveyAnimals.find((animal) => animal.critter_id === values.critter_id)}
            required
            clearOnSelect
            onSelect={(animal: ICritterSimpleResponse) => {
              if (animal) {
                setFieldValue('critter_id', animal.critter_id);
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" flex="1 1 auto">
            <CustomTextField
              name="frequency"
              label="Device frequency"
              other={{
                type: 'number',
                sx: { flex: 1 },
                required: !!(values.frequency_unit || values.frequency)
              }}
            />
            <AutocompleteField
              sx={{ flex: 0.4 }}
              name="frequency_unit"
              id="frequency_unit"
              label={'Unit'}
              options={frequencyUnits}
              required={!!(values.frequency || values.frequency_unit)}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
