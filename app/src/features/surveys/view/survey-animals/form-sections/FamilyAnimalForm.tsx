import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Fragment } from 'react';
//import { validate as uuidValidate } from 'uuid';
import { getAnimalFieldName, IAnimal, IAnimalRelationship, newFamilyIdPlaceholder } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

/**
 * Renders the Family section for the Individual Animal form
 *
 * This form needs to validate against the Critterbase critter table, as only critters that have already been
 * added to Critterbase are permissible as family members.
 *
 * Returns {*}
 */
const FamilyAnimalForm = () => {
  const { values, touched, errors, handleChange } = useFormikContext<IAnimal>();
  const critterbase = useCritterbaseApi();
  const { data: allFamilies, load } = useDataLoader(critterbase.family.getAllFamilies);

  if (!allFamilies) {
    load();
  }

  const name: keyof IAnimal = 'family';
  const newRelationship: IAnimalRelationship = {
    family_id: '',
    relationship: undefined
  };

  /*const validateCritterExists = async (critter_id: string) => {
    let error: string | undefined;
    if (!critter_id) {
      error = 'Required';
    }
    if (!uuidValidate(critter_id)) {
      error = 'Not a valid UUID.';
      return error;
    }
    try {
      //Check the actual critter table here.
      const critter = await critterbase.critters.getCritterByID(critter_id);
      if (critter.critter_id !== critter_id) {
        error = 'Critter not in critterbase.';
      }
    } catch {
      error = 'Critter not in critterbase.';
    }
    return error;
  };*/

  return (
    <FieldArray validateOnChange={true} name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalFamilyTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalFamilyTitle2}
            titleHelp={SurveyAnimalsI18N.animalFamilyHelp}
            btnLabel={SurveyAnimalsI18N.animalFamilyAddBtn}
            handleAddSection={() => push(newRelationship)}
            maxSections={1}
            handleRemoveSection={remove}>
            {values.family.map((_cap, index) => (
              <Fragment key={`family-inputs-${index}`}>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                    <InputLabel size="small" id={`relationship-family-${index}`}>
                      Family ID
                    </InputLabel>
                    <Select //Doing a raw MUI Select here since we don't enumerate these values in Critterbase
                      id={getAnimalFieldName<IAnimalRelationship>(name, 'family_id', index)}
                      name={getAnimalFieldName<IAnimalRelationship>(name, 'family_id', index)}
                      label={'family_id'}
                      size="small"
                      value={values.family[index]?.family_id ?? ''}
                      onChange={handleChange}
                      error={touched.family?.[index]?.relationship && Boolean(errors.family?.[index])}
                      displayEmpty>
                      {[
                        ...(allFamilies ?? []),
                        { family_id: newFamilyIdPlaceholder, family_label: newFamilyIdPlaceholder }
                      ]?.map((a) => (
                        <MenuItem key={a.family_id} value={a.family_id}>
                          {a.family_label ? a.family_label : a.family_id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/*<Grid item xs={6}></Grid>
                <Grid item xs={6}>
                  <Field //Using Formik Field here in order to have custom field level validation. Note that you can pass extra props and it will feed it to CustomTextField
                    as={CustomTextField}
                    name={getAnimalFieldName<IAnimalRelationship>(name, 'critter_id', index)}
                    label={"Individual's ID"}
                    other={{ size: 'small', required: true }}
                    validate={validateCritterExists}
                  />
                      </Grid>*/}
                <Grid item xs={6}>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                      <InputLabel size="small" id={`relationship-family-${index}`}>
                        Relationship
                      </InputLabel>
                      <Select //Doing a raw MUI Select here since we don't enumerate these values in Critterbase
                        id={getAnimalFieldName<IAnimalRelationship>(name, 'relationship', index)}
                        name={getAnimalFieldName<IAnimalRelationship>(name, 'relationship', index)}
                        label={'Relationship'}
                        size="small"
                        value={values.family[index]?.relationship ?? ''}
                        onChange={handleChange}
                        error={touched.family?.[index]?.relationship && Boolean(errors.family?.[index])}
                        displayEmpty>
                        <MenuItem key={'parent'} value={'parent'}>
                          Parent in
                        </MenuItem>
                        <MenuItem key={'child'} value={'child'}>
                          Child in
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <p>{errors && JSON.stringify(errors, null, 2)}</p>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default FamilyAnimalForm;
