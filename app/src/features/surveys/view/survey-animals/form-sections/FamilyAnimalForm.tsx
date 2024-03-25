import { Box, Button, Checkbox, FormControlLabel, Grid, MenuItem, Paper, Theme, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import ComponentDialog from 'components/dialog/ComponentDialog';
import EditDialog from 'components/dialog/EditDialog';
import { CbSelectWrapper } from 'components/fields/CbSelectFieldWrapper';
import CustomTextField from 'components/fields/CustomTextField';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IFamilyChildResponse, IFamilyParentResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import {
  AnimalFormProps,
  AnimalRelationship,
  ANIMAL_FORM_MODE,
  CreateCritterFamilySchema,
  ICreateCritterFamily,
  isRequiredInSchema
} from '../animal';

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
 * This component renders a 'critter family relationship' create / edit dialog.
 *
 * @param {AnimalFormProps<IFamilyParentResponse>} props - Generic AnimalFormProps.
 * @returns {*}
 */
export const FamilyAnimalForm = (props: AnimalFormProps<IFamilyParentResponse | IFamilyChildResponse>) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();
  const classes = useStyles();

  const [showFamilyStructure, setShowFamilyStructure] = useState(false);
  const [createNewFamily, setCreateNewFamily] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: familyHierarchy, load: loadHierarchy } = useDataLoader(cbApi.family.getImmediateFamily);
  const { data: allFamilies, load: loadFamilies } = useDataLoader(cbApi.family.getAllFamilies);
  loadFamilies();

  const handleSave = async (values: ICreateCritterFamily) => {
    setLoading(true);
    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        values.relationship === AnimalRelationship.CHILD
          ? await cbApi.family.createChildRelationship({
              family_id: values.family_id,
              family_label: values.family_label,
              child_critter_id: values.critter_id
            })
          : await cbApi.family.createParentRelationship({
              family_id: values.family_id,
              family_label: values.family_label,
              parent_critter_id: values.critter_id
            });

        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created family relationship.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        if (!values.family_id || !values.family_label) {
          throw new Error(`FamilyID or label undefined`);
        }
        await cbApi.family.editFamily(values.family_id, values.family_label);

        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited family relationship.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter family relationship request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Family Relationship' : 'Edit Family Relationship'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      size="md"
      dialogLoading={loading}
      component={{
        initialValues: {
          critter_id: props.critter.critter_id,
          family_id: props?.formObject?.family_id,
          family_label: props?.formObject?.family_label ?? '',
          relationship: (props?.formObject as IFamilyParentResponse)?.parent_critter_id
            ? AnimalRelationship.PARENT
            : AnimalRelationship.CHILD
        },
        validationSchema: CreateCritterFamilySchema,
        element: (
          <Grid container spacing={3}>
            {props.formMode === ANIMAL_FORM_MODE.ADD ? (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createNewFamily}
                      color="primary"
                      onChange={() => setCreateNewFamily((create) => !create)}
                    />
                  }
                  label="Would you like to create a new critter family?"
                />
              </Grid>
            ) : null}
            {props.formMode === ANIMAL_FORM_MODE.EDIT || createNewFamily ? (
              <Grid item xs={12}>
                <CustomTextField label="Family" name="family_label" />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <CbSelectWrapper
                  label={'Family'}
                  name={'family_id'}
                  controlProps={{
                    size: 'medium',
                    required: isRequiredInSchema(CreateCritterFamilySchema, 'family_id')
                  }}>
                  {allFamilies?.map((family) => (
                    <MenuItem key={family.family_id} value={family.family_id}>
                      {family.family_label ? family.family_label : family.family_id}
                    </MenuItem>
                  ))}
                </CbSelectWrapper>
              </Grid>
            )}
            <Grid item xs={12}>
              <Grid item xs={6}>
                <CbSelectWrapper
                  label={'Relationship'}
                  name={'relationship'}
                  controlProps={{
                    size: 'medium',
                    required: isRequiredInSchema(CreateCritterFamilySchema, 'relationship'),
                    disabled: props.formMode === ANIMAL_FORM_MODE.EDIT
                  }}>
                  <MenuItem key={'parent'} value={AnimalRelationship.PARENT}>
                    Parent in
                  </MenuItem>
                  <MenuItem key={'child'} value={AnimalRelationship.CHILD}>
                    Child in
                  </MenuItem>
                </CbSelectWrapper>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              {props?.formObject?.family_id ? (
                <Button
                  onClick={async () => {
                    loadHierarchy(props?.formObject?.family_id);
                    setShowFamilyStructure(true);
                  }}
                  variant="outlined">
                  View Family Structure
                </Button>
              ) : null}
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
                  {props?.formObject?.family_id}
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                  <Typography component="h4">Parents:</Typography>
                  <ul>
                    {familyHierarchy?.parents.map((a) => (
                      <li key={a.critter_id}>
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
                    {familyHierarchy?.children.map((critter) => (
                      <li key={critter.critter_id}>
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography component="dt" variant="subtitle2" color="textSecondary">
                              Critter ID
                            </Typography>
                            <Typography>{critter.critter_id}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography component="dt" variant="subtitle2" color="textSecondary">
                              Animal ID
                            </Typography>
                            <Typography>{critter.animal_id}</Typography>
                          </Grid>
                        </Grid>
                      </li>
                    ))}
                  </ul>
                </Paper>
              </Box>
            </ComponentDialog>
          </Grid>
        )
      }}
    />
  );
};

export default FamilyAnimalForm;
