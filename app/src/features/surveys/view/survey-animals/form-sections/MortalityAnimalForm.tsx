import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SpeciesAutoCompleteFormikField } from 'components/species/components/SpeciesAutoCompleteFormikField';
import { Field, useFormikContext } from 'formik';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { mapValues } from 'lodash-es';
import { useState } from 'react';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterMortalitySchema,
  ICreateCritterMortality,
  isRequiredInSchema
} from '../animal';
import FormLocationPreview from './LocationEntryForm';

/**
 * This component renders a 'critter mortality' create / edit dialog.
 *
 * @param {AnimalFormProps<IMarkingResponse>} props - Generic AnimalFormProps.
 * @returns {*}
 */
const MortalityAnimalForm = (props: AnimalFormProps<IMortalityResponse>) => {
  const critterbaseApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [loading, setLoading] = useState(false);

  const handleSave = async (values: ICreateCritterMortality) => {
    setLoading(true);
    // Replaces empty strings with null values.
    const patchedValues = mapValues(values, (value) => (value === '' ? null : value));

    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        await critterbaseApi.mortality.createMortality(patchedValues);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created mortality.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        await critterbaseApi.mortality.updateMortality(patchedValues);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited mortality.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter mortality request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Mortality' : 'Edit Mortality'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      debug
      component={{
        initialValues: {
          critter_id: props.critter.critter_id,
          mortality_id: props.formObject?.mortality_id,
          location: {
            location_id: props?.formObject?.location.location_id,
            latitude: props?.formObject?.location?.latitude ?? ('' as unknown as number),
            longitude: props?.formObject?.location?.longitude ?? ('' as unknown as number),
            coordinate_uncertainty: props?.formObject?.location?.coordinate_uncertainty ?? ('' as unknown as number),
            coordinate_uncertainty_unit: props?.formObject?.location?.coordinate_uncertainty_unit ?? 'm'
          },
          mortality_timestamp: (props.formObject?.mortality_timestamp ?? '') as unknown as Date,
          mortality_comment: props.formObject?.mortality_comment ?? undefined,
          proximate_cause_of_death_id: props.formObject?.proximate_cause_of_death_id ?? '',
          proximate_cause_of_death_confidence: props.formObject?.proximate_cause_of_death_confidence,
          proximate_predated_by_itis_tsn: props.formObject?.proximate_predated_by_itis_tsn ?? undefined,
          ultimate_cause_of_death_id: props.formObject?.ultimate_cause_of_death_id ?? undefined,
          ultimate_cause_of_death_confidence: props.formObject?.ultimate_cause_of_death_confidence,
          ultimate_predated_by_itis_tsn: props.formObject?.ultimate_predated_by_itis_tsn ?? undefined
        },
        validationSchema: CreateCritterMortalitySchema,
        element: <MortalityForm formObject={props.formObject} />
      }}
    />
  );
};

/**
 * This component renders the 'critter mortality' form fields.
 * Nested inside MortalityAnimalForm to use the formikContext hook.
 *
 * @param {Pick<AnimalFormProps<IMarkingResponse>, 'formObject'>} props - IMortalityResponse.
 * @returns {*}
 */
const MortalityForm = (props: Pick<AnimalFormProps<IMortalityResponse>, 'formObject'>) => {
  const { setFieldValue } = useFormikContext<ICreateCritterMortality>();

  const proximateTsn = props.formObject?.proximate_predated_by_itis_tsn;
  const ultimateTsn = props.formObject?.ultimate_predated_by_itis_tsn;

  const [pcodTaxonDisabled, setPcodTaxonDisabled] = useState(!proximateTsn); //Controls whether you can select taxons from the PCOD Taxon dropdown.
  const [ucodTaxonDisabled, setUcodTaxonDisabled] = useState(!ultimateTsn); //Controls whether you can select taxons from the UCOD Taxon dropdown.

  const handleCauseOfDeathReasonChange = (label: string, isProximateCOD: boolean) => {
    const isDisabled = !label.includes('Predation');
    if (isProximateCOD) {
      setPcodTaxonDisabled(isDisabled);
    } else {
      setUcodTaxonDisabled(isDisabled);
    }

    if (isDisabled) {
      setFieldValue('proximate_predated_by_itis_tsn', '', true);
    } else {
      setFieldValue('ultimate_predated_by_itis_tsn', '', true);
    }
  };
  return (
    <Stack gap={4}>
      <Box component="fieldset">
        <Typography component="legend">Date of Event</Typography>
        <SingleDateField
          name={'mortality_timestamp'}
          required={isRequiredInSchema(CreateCritterMortalitySchema, 'mortality_timestamp')}
          label={'Mortality Date'}
          aria-label="Mortality Date"
        />
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Proximate Cause of Death</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={'proximate_cause_of_death_id'}
              handleChangeSideEffect={(_value, label) => handleCauseOfDeathReasonChange(label, true)}
              orderBy={'asc'}
              label={'Reason'}
              controlProps={{
                required: isRequiredInSchema(CreateCritterMortalitySchema, 'proximate_cause_of_death_id')
              }}
              id={`pcod-reason`}
              route={'lookups/cods'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={'proximate_cause_of_death_confidence'}
              label={'Confidence'}
              controlProps={{
                required: isRequiredInSchema(CreateCritterMortalitySchema, 'proximate_cause_of_death_confidence')
              }}
              id={`pcod-confidence`}
              route={'lookups/enum/cod-confidence'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SpeciesAutoCompleteFormikField
              formikFieldName={'proximate_predated_by_itis_tsn'}
              disabled={pcodTaxonDisabled}
              required={isRequiredInSchema(CreateCritterMortalitySchema, 'proximate_predated_by_itis_tsn')}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Ultimate Cause of Death</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={'ultimate_cause_of_death_id'}
              orderBy={'asc'}
              handleChangeSideEffect={(_value, label) => {
                handleCauseOfDeathReasonChange(label, false);
              }}
              label={'Reason'}
              controlProps={{
                required: isRequiredInSchema(CreateCritterMortalitySchema, 'ultimate_cause_of_death_id')
              }}
              id={`ucod-reason`}
              route={'lookups/cods'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={'ultimate_cause_of_death_confidence'}
              label={'Confidence'}
              controlProps={{
                required: isRequiredInSchema(CreateCritterMortalitySchema, 'ultimate_cause_of_death_confidence')
              }}
              id={`ucod-confidence`}
              route={'lookups/enum/cod-confidence'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SpeciesAutoCompleteFormikField
              formikFieldName={'ultimate_predated_by_itis_tsn'}
              disabled={ucodTaxonDisabled}
              required={isRequiredInSchema(CreateCritterMortalitySchema, 'ultimate_predated_by_itis_tsn')}
            />
          </Grid>
        </Grid>
      </Box>

      <Box key="release-location" component="fieldset" mb={0}>
        <Typography component="legend">Mortality Location</Typography>
        <Grid container spacing={2}>
          <Grid item sm={4}>
            <Field
              as={CustomTextField}
              other={{ required: true, type: 'number' }}
              label={'Latitude'}
              name={'location.latitude'}
            />
          </Grid>
          <Grid item sm={4}>
            <CustomTextField
              other={{ required: true, type: 'number' }}
              label={'Longitude'}
              name={'location.longitude'}
            />
          </Grid>
          <Grid item sm={4}>
            <CustomTextField
              other={{
                required: true,
                type: 'number'
              }}
              label="Uncertainty (Meters)"
              name={'location.coordinate_uncertainty'}
            />
          </Grid>
        </Grid>
      </Box>

      <FormLocationPreview
        locations={[
          {
            title: 'Mortality',
            pingColour: 'blue',
            fields: { latitude: 'location.latitude', longitude: 'location.longitude' }
          }
        ]}
      />

      <Box component="fieldset">
        <Typography component="legend">Additional Details</Typography>
        <CustomTextField
          other={{
            required: isRequiredInSchema(CreateCritterMortalitySchema, 'mortality_comment'),
            multiline: true,
            minRows: 2
          }}
          label="Comments"
          name={'mortality_comment'}
        />
      </Box>
    </Stack>
  );
};

export default MortalityAnimalForm;
