import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import React from 'react';
import { AnimalFormProps, AnimalGeneralSchema, ANIMAL_FORM_MODE, isRequiredInSchema } from '../animal';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = (props: AnimalFormProps<ICritterSimpleResponse>) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const { setFieldValue } = useFormikContext();

  //const { errors, touched, setFieldValue } = useFormikContext<IAnimal>();

  //const { animalKeyName } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalGeneralTitle];
  //

  const handleSave = () => {
    console.log('saving');
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Marking' : 'Edit Marking'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      component={{
        initialValues: {},
        validationSchema: CreateCritter,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
                <SpeciesAutocompleteField
                  formikFieldName={'itis_tsn'}
                  label="Species"
                  required={true}
                  // error={
                  //   get(touched, getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_tsn'))
                  //     ? get(errors, getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_tsn'))
                  //     : undefined
                  // }
                  handleAddSpecies={(taxon) => {
                    setFieldValue('itis_tsn', taxon.tsn);
                    // setFieldValue(
                    //   getAnimalFieldName<IAnimalGeneral>(animalKeyName, 'itis_scientific_name'),
                    //   taxon.scientificName
                    // );
                  }}
                />
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
