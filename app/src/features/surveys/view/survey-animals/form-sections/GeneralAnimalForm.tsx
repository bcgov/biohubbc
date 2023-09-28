import Grid from '@mui/material/Grid';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { AnimalGeneralSchema, getAnimalFieldName, IAnimal, IAnimalGeneral, isRequiredInSchema } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

/**
 * Renders the General section for the Individual Animal form
 *
 * @return {*}
 */

const GeneralAnimalForm = () => {
  const { setFieldValue, handleBlur, values } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'general';

  const handleTaxonName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalGeneral>(name, 'taxon_name'), label);
  };

  return (
    <FormSectionWrapper
      title={SurveyAnimalsI18N.animalGeneralTitle}
      titleHelp={SurveyAnimalsI18N.animalGeneralHelp}
      innerPaperProps={{ elevation: 0, variant: 'elevation', sx: { p: 0, mb: 0 } }}>
      <Grid item key={'animal-general-section'}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <HelpButtonTooltip content={SurveyAnimalsI18N.taxonHelp}>
              <CbSelectField
                name={getAnimalFieldName<IAnimalGeneral>(name, 'taxon_id')}
                controlProps={{
                  required: isRequiredInSchema(AnimalGeneralSchema, 'taxon_id'),
                  disabled: !!values.collectionUnits.length
                }}
                label={'Species'}
                id={'taxon'}
                route={'lookups/taxons'}
                handleChangeSideEffect={handleTaxonName}
              />
            </HelpButtonTooltip>
          </Grid>
          <Grid item xs={12} md={6}>
              <CbSelectField
                name={getAnimalFieldName<IAnimalGeneral>(name, 'sex')}
                controlProps={{ required: isRequiredInSchema(AnimalGeneralSchema, 'sex') }}
                label="Sex"
                id={'sex'}
                route={'lookups/sex'}
              />
          </Grid>
          <Grid item xs={12} md={6}>
            <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
              <CustomTextField
                other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'animal_id') }}
                label="Alias"
                name={getAnimalFieldName<IAnimalGeneral>(name, 'animal_id')}
                handleBlur={handleBlur}
              />
            </HelpButtonTooltip>
          </Grid>
          <Grid item xs={12} md={6}>
          <HelpButtonTooltip content={SurveyAnimalsI18N.taxonLabelHelp}>
            <CustomTextField
              other={{ required: isRequiredInSchema(AnimalGeneralSchema, 'wlh_id') }}
              label="Wildlife Health ID (Optional)"
              name={getAnimalFieldName<IAnimalGeneral>(name, 'wlh_id')}
              handleBlur={handleBlur}
            />
          </HelpButtonTooltip>
          </Grid>
        </Grid>
      </Grid>
    </FormSectionWrapper>
  );
};

export default GeneralAnimalForm;
