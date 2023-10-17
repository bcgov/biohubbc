import { Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { SurveyContext } from 'contexts/surveyContext';
import { Form, Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useMemo } from 'react';
import { AnimalSchema, AnimalSex, IAnimal } from './animal';
import { transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import CaptureAnimalForm from './form-sections/CaptureAnimalForm';
import CollectionUnitAnimalForm from './form-sections/CollectionUnitAnimalForm';
import FamilyAnimalForm from './form-sections/FamilyAnimalForm';
import GeneralAnimalForm from './form-sections/GeneralAnimalForm';
import MarkingAnimalForm from './form-sections/MarkingAnimalForm';
import MeasurementAnimalForm from './form-sections/MeasurementAnimalForm';
import MortalityAnimalForm from './form-sections/MortalityAnimalForm';

interface IAddEditAnimalProps {
  currentCritterId: string;
  currentFormState: string;
}

export const AddEditAnimal = ({ currentCritterId, currentFormState }: IAddEditAnimalProps) => {
  const surveyContext = useContext(SurveyContext);
  const bhApi = useBiohubApi();

  const { data: critterData, load: loadCritters } = useDataLoader(() =>
    bhApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
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
      (critter: IDetailedCritterWithInternalId) => currentCritterId === critter.critter_id
    );
    if (!existingCritter) {
      return AnimalFormValues;
    }
    return transformCritterbaseAPIResponseToForm(existingCritter);
  }, [critterData, currentCritterId]);

  const renderFormContent = useMemo(() => {
    switch (currentFormState) {
      case SurveyAnimalsI18N.animalGeneralTitle:
        return <GeneralAnimalForm />;
      case SurveyAnimalsI18N.animalMarkingTitle:
        return <MarkingAnimalForm />;
      case SurveyAnimalsI18N.animalCaptureTitle:
        return <CaptureAnimalForm />;
      case SurveyAnimalsI18N.animalMortalityTitle:
        return <MortalityAnimalForm />;
      case SurveyAnimalsI18N.animalMeasurementTitle:
        return <MeasurementAnimalForm />;
      case SurveyAnimalsI18N.animalFamilyTitle:
        return <FamilyAnimalForm />;
      case SurveyAnimalsI18N.animalCollectionUnitTitle:
        return <CollectionUnitAnimalForm />;
      default:
        return <Typography>Unimplemented</Typography>;
    }
  }, [currentFormState]);

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
      onSubmit={(values) => {}}>
      <Form>{renderFormContent}</Form>
    </Formik>
  );
};
