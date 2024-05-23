import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import EditDialog from 'components/dialog/EditDialog';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SpeciesAutoCompleteFormikField } from 'components/species/components/SpeciesAutoCompleteFormikField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterDetailedResponse, ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { v4 } from 'uuid';
import { AnimalSex, ANIMAL_FORM_MODE, CreateCritterSchema, ICreateCritter, isRequiredInSchema } from '../animal';

export type GeneralAnimalFormProps<T> =
  | {
      formObject?: never;
      formMode: ANIMAL_FORM_MODE.ADD;
      open: boolean;
      handleClose: () => void;
      critter?: never;
      projectId: number;
      surveyId: number;
    }
  | {
      formObject: T;
      formMode: ANIMAL_FORM_MODE.EDIT;
      open: boolean;
      handleClose: () => void;
      critter: ICritterDetailedResponse | ICritterSimpleResponse;
      projectId?: never;
      surveyId?: never;
    };

/**
 * This component renders a 'critter' create / edit dialog.
 * Handles the basic properties of a Critterbase critter.
 *
 * @param {GeneralAnimalFormProps<ICreateCritter>} props
 * @returns {*}
 */
const GeneralAnimalForm = (props: GeneralAnimalFormProps<ICreateCritter>) => {
  const critterbaseApi = useCritterbaseApi();
  const biohubApi = useBiohubApi();
  const dialog = useDialogContext();

  const [loading, setLoading] = useState(false);

  const handleSave = async (values: ICreateCritter) => {
    setLoading(true);
    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        await biohubApi.survey.createCritterAndAddToSurvey(props.projectId, props.surveyId, values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created critter.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        await critterbaseApi.critters.updateCritter(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited critter.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Critter' : 'Edit Critter'}
      open={props.open}
      size="md"
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      debug
      component={{
        initialValues: {
          /**
           * Omitting itis_scientific_name.
           * Critterbase queries scientific name regardless if included.
           */
          critter_id: props.critter?.critter_id ?? v4(),
          sex: props.critter?.sex as AnimalSex,
          itis_tsn: (props.critter?.itis_tsn ?? '') as unknown as number,
          animal_id: props.critter?.animal_id ?? '',
          wlh_id: props.critter?.wlh_id ? props.critter.wlh_id : undefined
        },
        validationSchema: CreateCritterSchema,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
                <SpeciesAutoCompleteFormikField
                  formikFieldName={'itis_tsn'}
                  disabled={props.formMode === ANIMAL_FORM_MODE.EDIT}
                />
              </HelpButtonTooltip>
            </Grid>
            <Grid item xs={12}>
              <CbSelectField
                name={'sex'}
                controlProps={{ required: isRequiredInSchema(CreateCritterSchema, 'sex') }}
                label="Sex"
                id={'sex'}
                route={'lookups/enum/sex'}
              />
            </Grid>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
                <CustomTextField
                  other={{ required: isRequiredInSchema(CreateCritterSchema, 'animal_id') }}
                  label="Alias"
                  name={'animal_id'}
                />
              </HelpButtonTooltip>
            </Grid>
            <Grid item xs={12}>
              <HelpButtonTooltip content={SurveyAnimalsI18N.wlhIdHelp}>
                <CustomTextField
                  other={{ required: isRequiredInSchema(CreateCritterSchema, 'wlh_id') }}
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
