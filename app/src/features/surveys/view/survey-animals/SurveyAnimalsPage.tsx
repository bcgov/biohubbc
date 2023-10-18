import { Typography } from '@mui/material';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SurveySectionFullPageLayout } from 'features/surveys/components/SurveySectionFullPageLayout';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { AddEditAnimal } from './AddEditAnimal';
import { AnimalSchema, AnimalSex, IAnimal, IAnimalSubSections } from './animal';
import { createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import AnimalList from './AnimalList';

export const SurveyAnimalsPage = () => {
  const [selectedSection, setSelectedSection] = useState<IAnimalSubSections>('General');
  //const [selectedCritterID, setSelectedCritterID] = useState<string | null>(null);
  const { survey_critter_id } = useParams<{ survey_critter_id?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bhApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const { surveyId, projectId } = useContext(SurveyContext);

  const { data: critterData, load: loadCritters } = useDataLoader(() =>
    bhApi.survey.getSurveyCritters(projectId, surveyId)
  );

  loadCritters();

  const setPopup = (message: string) => {
    dialogContext.setSnackbar({
      open: true,
      snackbarMessage: (
        <Typography variant="body2" component="div">
          {message}
        </Typography>
      )
    });
  };

  const obtainAnimalFormInitialvalues = useMemo(() => {
    console.log('Recalculated initial values!');
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
      (critter: IDetailedCritterWithInternalId) => Number(survey_critter_id) === Number(critter.survey_critter_id)
    );
    if (!existingCritter) {
      console.log(`No existing critter for ${survey_critter_id} ${typeof survey_critter_id}`);
      return AnimalFormValues;
    }
    return transformCritterbaseAPIResponseToForm(existingCritter);
  }, [critterData, survey_critter_id]);

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
      const surveyCritter = critterData?.find((critter) => critter.critter_id === survey_critter_id);
      if (!survey_critter_id || !surveyCritter) {
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
      setPopup('Successfully updated animal.');
    } catch (err) {
      setPopup(`Submmision failed ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={obtainAnimalFormInitialvalues}
      enableReinitialize
      validationSchema={AnimalSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={handleCritterSave}>
      <SurveySectionFullPageLayout
        pageTitle="Manage Animals"
        sideBarComponent={
          <AnimalList selectedSection={selectedSection} onSelectSection={(section) => setSelectedSection(section)} />
        }
        mainComponent={<AddEditAnimal isLoading={isSubmitting} section={selectedSection} />}
      />
    </Formik>
  );
};
