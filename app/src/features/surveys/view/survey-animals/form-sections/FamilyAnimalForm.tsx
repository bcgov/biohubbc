import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Fragment } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalRelationship } from '../animal';
import FormSectionWrapper from './FormSectionWrapper';

const FamilyAnimalForm = () => {
  const { values, touched, errors, handleChange, handleBlur } = useFormikContext<IAnimal>();
  const critterbase = useCritterbaseApi();
  const critterLoader = useDataLoader(critterbase.critters.getAllCritters);
  if (!critterLoader.data) {
    critterLoader.load();
  }

  const name: keyof IAnimal = 'family';
  const newRelationship: IAnimalRelationship = {
    critter_id: '',
    relationship: undefined
  };

  const validateCritterExists = async (critter_id: string) => {
    let error: string | undefined;
    if (!critter_id) {
      error = 'Required';
    }
    try {
      const critter = await critterbase.critters.getCritterByID(critter_id);
      if (critter.critter_id !== critter_id) {
        error = 'Critter not in critterbase.';
      }
    } catch {
      error = 'Critter not in critterbase.';
    }
    return error;
  };

  return (
    <FieldArray validateOnChange={true} name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalFamilyTitle}
            titleHelp={SurveyAnimalsI18N.animalFamilyHelp}
            btnLabel={SurveyAnimalsI18N.animalFamilyAddBtn}
            handleAddSection={() => push(newRelationship)}
            handleRemoveSection={remove}>
            {values.family.map((_cap, index) => (
              <Fragment key={`family-inputs-${index}`}>
                <Grid item xs={6}>
                  <Field
                    as={CustomTextField}
                    name={getAnimalFieldName<IAnimalRelationship>(name, 'critter_id', index)}
                    label={"Individual's ID"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    size="small"
                    validate={validateCritterExists}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                      <InputLabel size="small" id={`relationship-family-${index}`}>
                        Relationship
                      </InputLabel>
                      <Select
                        id={getAnimalFieldName<IAnimalRelationship>(name, 'relationship', index)}
                        name={getAnimalFieldName<IAnimalRelationship>(name, 'relationship', index)}
                        label={'Relationship'}
                        size="small"
                        value={values.family[index]?.relationship ?? ''}
                        onChange={handleChange}
                        error={touched.family?.[index].relationship && Boolean(errors.family?.[index])}
                        displayEmpty>
                        <MenuItem key={'parent'} value={'parent'}>
                          Parent
                        </MenuItem>
                        <MenuItem key={'child'} value={'child'}>
                          Child
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default FamilyAnimalForm;
