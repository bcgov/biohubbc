import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { Form, useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import yup from 'utils/YupSchema';
import { IAnimal, IAnimalSubSections } from './animal';
import { AnimalTelemetryDeviceSchema, IAnimalTelemetryDevice } from './device';
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
  const [openDeviceForm, setOpenDeviceForm] = useState(false);
  const { section, isLoading } = props;
  const surveyContext = useContext(SurveyContext);
  const { survey_critter_id } = useParams<{ survey_critter_id: string }>();
  const { submitForm, initialValues, values, resetForm } = useFormikContext<IAnimal>();

  const DeviceFormValues: IAnimalTelemetryDevice = useMemo(() => {
    return {
      device_id: '' as unknown as number,
      device_make: '',
      frequency: '' as unknown as number,
      frequency_unit: '',
      device_model: '',
      deployments: [
        {
          deployment_id: '',
          attachment_start: '',
          attachment_end: undefined
        }
      ]
    };
  }, []);

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
        <Box>
          <Button onClick={() => setOpenDeviceForm(true)} sx={{ marginBottom: 3 }} variant="contained" color="primary">
            New Device / Deployment
          </Button>
          <EditDialog
            dialogTitle={'New Device / Deployment'}
            open={openDeviceForm}
            component={{
              element: <TelemetryDeviceForm mode={TELEMETRY_DEVICE_FORM_MODE.ADD} removeAction={() => {}} />,
              initialValues: { device: [DeviceFormValues] },
              validationSchema: yup.object({ device: yup.array(AnimalTelemetryDeviceSchema) })
            }}
            onCancel={() => setOpenDeviceForm(false)}
            onSave={() => setOpenDeviceForm(false)}></EditDialog>
          <TelemetryDeviceForm mode={TELEMETRY_DEVICE_FORM_MODE.EDIT} removeAction={() => {}} />
        </Box>
      )
    };
    return sectionMap[section] ? sectionMap[section] : <Typography>Unimplemented</Typography>;
  }, [DeviceFormValues, openDeviceForm, section]);

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
        <Grid item mb={3}>
          <CustomTextField
            label="Critter ID"
            name="test"
            other={{
              InputProps: {
                endAdornment: (
                  <IconButton aria-label={`Copy Critter ID`}>
                    <Icon path={mdiContentCopy} size={0.8} />
                  </IconButton>
                )
              },
              disabled: true,
              variant: 'filled',
              defaultValue: initialValues.general.critter_id,
              sx: { maxWidth: '30%' }
            }}
          />
        </Grid>
        <Form>{parseInt(survey_critter_id) ? renderFormContent : null}</Form>
      </Box>
    </>
  );
};
