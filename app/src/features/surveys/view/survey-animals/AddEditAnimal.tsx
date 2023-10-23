import { mdiContentCopy, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArray, FieldArrayRenderProps, Form, useFormikContext } from 'formik';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { isEqual } from 'lodash-es';
import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { AnimalSchema, getAnimalFieldName, IAnimal, IAnimalGeneral } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';
import { AnimalSectionDataCards } from './AnimalSectionDataCards';
import { IAnimalDeployment } from './device';
import { CaptureAnimalFormContent } from './form-sections/CaptureAnimalForm';

interface AddEditAnimalProps {
  section: IAnimalSections;
  critterData?: IDetailedCritterWithInternalId[];
  deploymentData?: IAnimalDeployment[];
  isLoading?: boolean;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const { section, isLoading, critterData } = props;
  const surveyContext = useContext(SurveyContext);
  const { survey_critter_id } = useParams<{ survey_critter_id: string }>();
  const { submitForm, initialValues, values, resetForm, setFieldValue } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);

  const critter = critterData?.find((cData) => cData.survey_critter_id === parseInt(survey_critter_id));

  const [showDialog, setShowDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openedFromAddButton, setOpenedFromAddButton] = useState(false);

  const renderSingleForm = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <Typography>Unimplemented</Typography>,
      [SurveyAnimalsI18N.animalMarkingTitle]: <Typography>Unimplemented</Typography>,
      [SurveyAnimalsI18N.animalMeasurementTitle]: <Typography>Unimplemented</Typography>,
      [SurveyAnimalsI18N.animalCaptureTitle]: (
        <CaptureAnimalFormContent name={'captures'} index={selectedIndex} value={values.captures[selectedIndex]} />
      ),
      [SurveyAnimalsI18N.animalMortalityTitle]: <Typography>Unimplemented</Typography>,
      [SurveyAnimalsI18N.animalFamilyTitle]: <Typography>Unimplemented</Typography>,
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <Typography>Unimplemented</Typography>,
      Telemetry: <Typography>Unimplemented</Typography>
    };
    return sectionMap[section] ? sectionMap[section] : <Typography>Unimplemented</Typography>;
  }, [section, selectedIndex, values.captures]);

  const setPopup = (message: string) => {
    dialogContext.setSnackbar({
      open: true,
      snackbarAutoCloseMs: 1500,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      )
    });
  };

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc',
          '& button': {
            minWidth: '6rem'
          },
          '& button + button': {
            ml: 1
          }
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          {initialValues?.general?.animal_id ? `Animal Details > ${section}` : 'Animal Details'}
        </Typography>
        <Box
          sx={{
            '& div:first-of-type': {
              display: 'flex',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }
          }}>
          <Box display="flex" overflow="hidden">
            {ANIMAL_SECTIONS_FORM_MAP[section]?.addBtnText ? (
              <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
                {({ push, remove }: FieldArrayRenderProps) => (
                  <>
                    <EditDialog
                      dialogTitle={`Add ${ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}`}
                      open={showDialog}
                      component={{
                        initialValues: values,
                        element: renderSingleForm,
                        validationSchema: AnimalSchema
                      }}
                      onCancel={() => {
                        if (openedFromAddButton) {
                          remove(selectedIndex);
                        }
                        setOpenedFromAddButton(false);
                        setShowDialog(false);
                      }}
                      onSave={(saveVals) => {
                        setOpenedFromAddButton(false);
                        setShowDialog(false);
                        setFieldValue(
                          ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName,
                          saveVals[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName]
                        );
                      }}
                    />
                    <Button
                      startIcon={<Icon path={mdiPlus} size={1} />}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        //Remove this before handling the modal section
                        // This is where we will open the modal from
                        setOpenedFromAddButton(true);
                        push(ANIMAL_SECTIONS_FORM_MAP[section]?.defaultFormValue());
                        setSelectedIndex(
                          (values[ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName] as any)['length'] ?? 0
                        );
                        setShowDialog(true);
                      }}>
                      {ANIMAL_SECTIONS_FORM_MAP[section].addBtnText}
                    </Button>
                  </>
                )}
              </FieldArray>
            ) : null}
            <Collapse in={!isEqual(initialValues, values)} orientation="horizontal">
              <Box ml={1} whiteSpace="nowrap">
                <LoadingButton loading={isLoading} variant="contained" color="primary" onClick={() => submitForm()}>
                  Save
                </LoadingButton>
                <Button variant="outlined" color="primary" onClick={() => resetForm()}>
                  Discard Changes
                </Button>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Toolbar>
      <Box p={2}>
        {initialValues.general.critter_id ? (
          <Grid container>
            <Grid item mb={2} lg={4} sm={12} md={8}>
              <CustomTextField
                label="Critter ID"
                name={getAnimalFieldName<IAnimalGeneral>('general', 'critter_id')}
                other={{
                  InputProps: {
                    endAdornment: (
                      <IconButton
                        aria-label={`Copy Critter ID`}
                        onClick={() => {
                          navigator.clipboard.writeText(initialValues.general?.critter_id ?? '');
                          setPopup('Copied Critter ID');
                        }}>
                        <Icon path={mdiContentCopy} size={0.8} />
                      </IconButton>
                    )
                  },
                  disabled: true,
                  variant: 'filled'
                }}
              />
            </Grid>
          </Grid>
        ) : null}
        <Form>{critter ? <AnimalSectionDataCards section={section} critter={critter} /> : null}</Form>
      </Box>
    </>
  );
};
