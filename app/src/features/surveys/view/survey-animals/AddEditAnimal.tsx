import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FieldArray, FieldArrayRenderProps, Form, useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router';
import { getAnimalFieldName, IAnimal, IAnimalGeneral, IAnimalSubSections } from './animal';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';
import TelemetryDeviceForm, { TELEMETRY_DEVICE_FORM_MODE } from './TelemetryDeviceForm';

interface AddEditAnimalProps {
  section: IAnimalSubSections;
  isLoading?: boolean;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const { section, isLoading } = props;
  const surveyContext = useContext(SurveyContext);
  const { survey_critter_id } = useParams<{ survey_critter_id: string }>();
  const { submitForm, initialValues, values, resetForm } = useFormikContext<IAnimal>();
  const dialogContext = useContext(DialogContext);

  const renderFormContent = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSubSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <GeneralAnimalForm />,
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalForm />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: <MeasurementAnimalForm />,
      [SurveyAnimalsI18N.animalCaptureTitle]: <CaptureAnimalForm />,
      [SurveyAnimalsI18N.animalMortalityTitle]: <MortalityAnimalForm />,
      [SurveyAnimalsI18N.animalFamilyTitle]: <FamilyAnimalForm />,
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <CollectionUnitAnimalForm />,
      Telemetry: (
        <TelemetryDeviceForm mode={TELEMETRY_DEVICE_FORM_MODE.EDIT} removeAction={() => console.log('remove')} />
      )
    };
    return sectionMap[section] ? sectionMap[section] : <Typography>Unimplemented</Typography>;
  }, [section]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

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
          {initialValues?.general?.animal_id
            ? `Animal Details: ${initialValues?.general?.animal_id}`
            : 'Animal Details'}
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
            <FieldArray name="markings">
              {({ push }: FieldArrayRenderProps) => (
                <Button variant="outlined" color="primary" onClick={() => push({})}>
                  Add Record
                </Button>
              )}
            </FieldArray>
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
                  variant: 'filled',
                  defaultValue: initialValues.general.critter_id
                }}
              />
            </Grid>
          </Grid>
        ) : null}
        <Form>{parseInt(survey_critter_id) ? renderFormContent : null}</Form>
      </Box>
    </>
  );
};
