import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Theme, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { Fragment, useState } from 'react';
import { v4 } from 'uuid';
//import { validate as uuidValidate } from 'uuid';
import {
  AnimalRelationshipSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalRelationship,
  isRequiredInSchema,
  lastAnimalValueValid,
  newFamilyIdPlaceholder
} from '../animal';
import FormSectionWrapper from './FormSectionWrapper';
const useStyles = makeStyles((theme: Theme) => ({
  surveyMetadataContainer: {
    '& dt': {
      flex: '0 0 40%'
    },
    '& dd': {
      flex: '1 1 auto'
    },
    '& h4': {
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.02rem',
      textTransform: 'uppercase',
      color: grey[600],
      '& + hr': {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
      }
    }
  }
}));
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
  const { data: familyHierarchy, load: loadHierarchy } = useDataLoader(critterbase.family.getImmediateFamily);
  const [showFamilyStructure, setShowFamilyStructure] = useState(false);
  if (!allFamilies) {
    load();
  }

  const classes = useStyles();

  const name: keyof IAnimal = 'family';
  const newRelationship: IAnimalRelationship = {
    _id: v4(),

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
            disableAddBtn={!lastAnimalValueValid('family', values)}
            handleAddSection={() => push(newRelationship)}
            maxSections={1}
            handleRemoveSection={remove}>
            {values.family.map((fam, index) => (
              <Fragment key={fam._id}>
                <Grid item xs={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    required={isRequiredInSchema(AnimalRelationshipSchema, 'family_id')}
                    style={{ width: '100%' }}>
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
                <Grid item xs={6}>
                  <Grid item xs={6}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      required={isRequiredInSchema(AnimalRelationshipSchema, 'relationship')}
                      style={{ width: '100%' }}>
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
                <Grid item xs={6}>
                  <Button
                    onClick={async () => {
                      loadHierarchy(values.family[index]?.family_id);
                      setShowFamilyStructure(true);
                    }}
                    disabled={
                      values.family[index]?.family_id === newFamilyIdPlaceholder || !values.family[index]?.family_id
                    }
                    variant="outlined">
                    View Family Structure
                  </Button>
                </Grid>
                <ComponentDialog
                  dialogTitle={'Family Structure'}
                  open={showFamilyStructure}
                  onClose={() => setShowFamilyStructure(false)}>
                  <Box className={classes.surveyMetadataContainer}>
                    <Typography component="dt" variant="subtitle2" color="textSecondary">
                      Family ID
                    </Typography>
                    <Typography marginBottom={2} component="dd">
                      {values.family[index]?.family_id}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                      <Typography component="h4">Parents:</Typography>
                      <ul>
                        {familyHierarchy?.parents.map((a) => (
                          <li>
                            <Grid container>
                              <Grid item xs={6}>
                                <Typography component="dt" variant="subtitle2" color="textSecondary">
                                  Critter ID
                                </Typography>
                                <Typography>{a.critter_id}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography component="dt" variant="subtitle2" color="textSecondary">
                                  Animal ID
                                </Typography>
                                <Typography>{a.animal_id}</Typography>
                              </Grid>
                            </Grid>
                          </li>
                        ))}
                      </ul>
                    </Paper>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                      <Typography component="h4">Children:</Typography>
                      <ul>
                        {familyHierarchy?.children.map(
                          (
                            a: { critter_id: string; animal_id: string } //I will type this better I promise
                          ) => (
                            <li>
                              <Grid container>
                                <Grid item xs={6}>
                                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                                    Critter ID
                                  </Typography>
                                  <Typography>{a.critter_id}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                                    Animal ID
                                  </Typography>
                                  <Typography>{a.animal_id}</Typography>
                                </Grid>
                              </Grid>
                            </li>
                          )
                        )}
                      </ul>
                    </Paper>
                  </Box>
                </ComponentDialog>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default FamilyAnimalForm;
