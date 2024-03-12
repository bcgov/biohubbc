import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, FieldProps } from 'formik';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { get } from 'lodash-es';
import React from 'react';
import { v4 } from 'uuid';
import { AnimalFormProps, AnimalGeneralSchema, ANIMAL_FORM_MODE, isRequiredInSchema } from '../animal';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = (props: AnimalFormProps<ICritterSimpleResponse>) => {
  // const cbApi = useCritterbaseApi();
  // const dialog = useDialogContext();

  //const { setFieldValue } = useFormikContext();

  //const { errors, touched, setFieldValue } = useFormikContext();

  //const { animalKeyName } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalGeneralTitle];
  //

  const handleSave = () => {
    console.log('saving');
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Critter' : 'Edit Critter'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      debug
      component={{
        initialValues: {
          /**
           * Omitting itis_scientific_name.
           * Critterbase has to query for scientific name regardless if included.
           */
          critter_id: props.critter.critter_id ?? v4(),
          sex: props.critter.animal_id ?? '',
          itis_tsn: props.critter.itis_tsn,
          animal_id: props.critter.animal_id,
          wlh_id: props.critter.wlh_id
        },
        validationSchema: AnimalGeneralSchema,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
                <Field name={'itis_tsn'}>
                  {({ field, form, meta }: FieldProps) => (
                    <SpeciesAutocompleteField
                      formikFieldName={'itis_tsn'}
                      label="Species"
                      required={isRequiredInSchema(AnimalGeneralSchema, 'itis_tsn')}
                      error={meta.touched && meta.error ? meta.error : undefined}
                      //value={props.critter.itis_scientific_name}
                      defaultSpecies={{
                        tsn: props.critter.itis_tsn,
                        scientificName: props.critter.itis_scientific_name,
                        commonName: null
                      }}
                      //value={get(form.values, 'itis_tsn')}
                      handleAddSpecies={(taxon) => {
                        console.log(get(form.values, 'itis_tsn'));
                        form.setFieldValue('itis_tsn', taxon.tsn);
                      }}
                    />
                  )}
                </Field>
              </HelpButtonTooltip>
            </Grid>
            <Grid item xs={12}>
              <CbSelectField
                name={'sex'}
                controlProps={{ required: isRequiredInSchema(AnimalGeneralSchema, 'sex') }}
                label="Sex"
                id={'sex'}
                route={'lookups/enum/sex'}
              />
            </Grid>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
                <CustomTextField
                  other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'animal_id') }}
                  label="Alias"
                  name={'animal_id'}
                />
              </HelpButtonTooltip>
            </Grid>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.wlhIdHelp}>
                <CustomTextField
                  other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'wlh_id') }}
                  label="Wildlife Health ID (Optional)"
                  name={'wlh_id'}
                />
              </HelpButtonTooltip>
            </Grid>
          </Grid>
        )
      }}></EditDialog>
  );
};

export default GeneralAnimalForm;
