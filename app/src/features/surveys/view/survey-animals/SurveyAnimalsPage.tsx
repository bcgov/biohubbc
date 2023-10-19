import { Box, Typography } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
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
import { AnimalSchema, AnimalSex, Critter, IAnimal } from './animal';
import { createCritterUpdatePayload, transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import { IAnimalSections } from './animal-sections';
import AnimalList from './AnimalList';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import { ANIMAL_FORM_MODE } from './IndividualAnimalForm';

export const SurveyAnimalsPage = () => {
  const [selectedSection, setSelectedSection] = useState<IAnimalSections>('General');
  //const [selectedCritterID, setSelectedCritterID] = useState<string | null>(null);
  const { survey_critter_id } = useParams<{ survey_critter_id?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const bhApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const { surveyId, projectId } = useContext(SurveyContext);

  const {
    data: critterData,
    load: loadCritters,
    refresh: refreshCritters,
    isLoading: crittersLoading
  } = useDataLoader(() => bhApi.survey.getSurveyCritters(projectId, surveyId));

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

  const defaultFormValues: IAnimal = useMemo(() => {
    return {
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
  }, []);

  const critterAsFormikValues = useMemo(() => {
    const existingCritter = critterData?.find(
      (critter: IDetailedCritterWithInternalId) => Number(survey_critter_id) === Number(critter.survey_critter_id)
    );
    if (!existingCritter) {
      return defaultFormValues;
    }
    return transformCritterbaseAPIResponseToForm(existingCritter);
  }, [defaultFormValues, critterData, survey_critter_id]);

  const handleCritterSave = async (currentFormValues: IAnimal, formMode: ANIMAL_FORM_MODE) => {
    const postCritterPayload = async () => {
      const critter = new Critter(currentFormValues);
      setOpenAddDialog(false);
      await bhApi.survey.createCritterAndAddToSurvey(projectId, surveyId, critter);
      setPopup('Animal added to survey.');
    };
    const patchCritterPayload = async () => {
      const initialFormValues = critterAsFormikValues;
      if (!initialFormValues) {
        throw Error('Could not obtain initial form values.');
      }
      const { create: createCritter, update: updateCritter } = createCritterUpdatePayload(
        initialFormValues,
        currentFormValues
      );
      const surveyCritter = critterData?.find(
        (critter) => Number(critter.survey_critter_id) === Number(survey_critter_id)
      );
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
    };
    try {
      setIsSubmitting(true);
      if (formMode === ANIMAL_FORM_MODE.ADD) {
        await postCritterPayload();
      } else {
        await patchCritterPayload();
      }
      refreshCritters();
      setPopup(`Successfully ${formMode === ANIMAL_FORM_MODE.ADD ? 'created' : 'updated'} animal.`);
    } catch (err) {
      setPopup(`Submmision failed ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={critterAsFormikValues}
        enableReinitialize
        validationSchema={AnimalSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          handleCritterSave(values, ANIMAL_FORM_MODE.EDIT);
        }}>
        <SurveySectionFullPageLayout
          pageTitle="Manage Animals"
          sideBarComponent={
            <AnimalList
              onAddButton={() => setOpenAddDialog(true)}
              critterData={critterData}
              isLoading={crittersLoading}
              selectedSection={selectedSection}
              onSelectSection={(section) => setSelectedSection(section)}
            />
          }
          mainComponent={<AddEditAnimal isLoading={isSubmitting} section={selectedSection} />}
        />
      </Formik>
      <EditDialog
        dialogTitle={'Add New Animal'}
        open={openAddDialog}
        component={{
          element: (
            <Box>
              <Typography marginBottom={4}>
                Add basic animal info from this form. If you need to add captures, markings, or other details, you may
                do so after submitting these fields first.
              </Typography>
              <GeneralAnimalForm />
            </Box>
          ),
          initialValues: defaultFormValues,
          validationSchema: AnimalSchema
        }}
        dialogSaveButtonLabel="Create Animal"
        onCancel={() => setOpenAddDialog(false)}
        onSave={(values) => handleCritterSave(values, ANIMAL_FORM_MODE.ADD)}
      />
    </>
  );
};
