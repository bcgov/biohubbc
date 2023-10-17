import { LoadingButton } from '@mui/lab';
import { Box, Button, Collapse, Toolbar, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { Form, Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useMemo, useState } from 'react';
import { AnimalSchema, AnimalSex, IAnimal, IAnimalSubSections } from './animal';
import { createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

interface AddEditAnimalProps {
  critter_id: string | null;
  section: IAnimalSubSections;
}

export const AddEditAnimal = (props: AddEditAnimalProps) => {
  const surveyContext = useContext(SurveyContext);
  const bhApi = useBiohubApi();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projectId, surveyId } = surveyContext;
  const { critter_id, section } = props;

  const { data: critterData, load: loadCritters } = useDataLoader(() =>
    bhApi.survey.getSurveyCritters(projectId, surveyId)
  );

  loadCritters();

  const obtainAnimalFormInitialvalues = useMemo(() => {
    const AnimalFormValues: IAnimal = {
      general: { wlh_id: '', taxon_id: '', taxon_name: '', animal_id: '', sex: AnimalSex.UNKNOWN, critter_id: '' },
      captures: [],
      markings: [],
      mortality: [],
      collectionUnits: [],
      measurements: [],
      family: [],
      images: [],
      device: undefined
    };

    const existingCritter = critterData?.find(
      (critter: IDetailedCritterWithInternalId) => critter_id === critter.critter_id
    );
    if (!existingCritter) {
      return AnimalFormValues;
    }
    return transformCritterbaseAPIResponseToForm(existingCritter);
  }, [critterData, critter_id]);

  const handleCritterSave = async (currentFormValues: IAnimal) => {
    const patchCritterPayload = async () => {
      const initialFormValues = obtainAnimalFormInitialvalues;
      if (!initialFormValues) {
        throw Error('Could not obtain initial form values.');
      }
      const { create: createCritter, update: updateCritter } = createCritterUpdatePayload(
        initialFormValues,
        currentFormValues
      );
      const surveyCritter = critterData?.find((critter) => critter.critter_id === critter_id);
      if (!critter_id || !surveyCritter) {
        throw Error('The internal critter id for this row was not set correctly.');
      }
      await bhApi.survey.updateSurveyCritter(
        projectId,
        surveyId,
        surveyCritter.survey_critter_id,
        updateCritter,
        createCritter
      );
      /*console.log(`Initial values. ${JSON.stringify(initialFormValues, null, 2)}`);
      console.log(`Current values. ${JSON.stringify(currentFormValues, null, 2)}`);

      console.log(`Create payload. ${JSON.stringify(createCritter, null, 2)}`);
      console.log(`Update payload. ${JSON.stringify(updateCritter, null, 2)}`);*/
    };
    try {
      setIsSubmitting(true);
      await patchCritterPayload();
    } catch (err) {
      console.log(`Submmision failed ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormContent = useMemo(() => {
    const sectionMap: Partial<Record<IAnimalSubSections, JSX.Element>> = {
      [SurveyAnimalsI18N.animalGeneralTitle]: <GeneralAnimalForm />,
      [SurveyAnimalsI18N.animalMarkingTitle]: <MarkingAnimalForm />,
      [SurveyAnimalsI18N.animalMeasurementTitle]: <MeasurementAnimalForm />,
      [SurveyAnimalsI18N.animalCaptureTitle]: <CaptureAnimalForm />,
      [SurveyAnimalsI18N.animalMortalityTitle]: <MortalityAnimalForm />,
      [SurveyAnimalsI18N.animalFamilyTitle]: <FamilyAnimalForm />,
      [SurveyAnimalsI18N.animalCollectionUnitTitle]: <CollectionUnitAnimalForm />
    };
    return sectionMap[section] ? sectionMap[section] : <Typography>Unimplemented</Typography>;
  }, [section]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Formik
      initialValues={obtainAnimalFormInitialvalues}
      enableReinitialize
      validationSchema={AnimalSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={handleCritterSave}>
      {(formikProps) => (
        <Form>
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
              {critter_id ? `Animal: ${obtainAnimalFormInitialvalues.general.animal_id}` : 'No Animal Selected'}
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
                <Collapse in={!!critter_id} orientation="horizontal">
                  <Box ml={1} whiteSpace="nowrap">
                    <LoadingButton
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      onClick={formikProps.submitForm}>
                      Save Changes
                    </LoadingButton>

                    <Button variant="outlined" color="primary" onClick={() => console.log('discarding')}>
                      Discard Changes
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </Toolbar>
          {critter_id ? renderFormContent : null}
        </Form>
      )}
    </Formik>
  );
};
