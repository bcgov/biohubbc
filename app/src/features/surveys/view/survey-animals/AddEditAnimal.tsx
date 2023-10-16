import CircularProgress from '@mui/material/CircularProgress';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useMemo, useState } from 'react';
import { AnimalSchema, AnimalSex, IAnimal } from './animal';
import { transformCritterbaseAPIResponseToForm } from './animal-form-helpers';
import IndividualAnimalForm from './IndividualAnimalForm';

export const AddEditAnimal = () => {
  const surveyContext = useContext(SurveyContext);
  const bhApi = useBiohubApi();

  const { data: critterData, load: loadCritters } = useDataLoader(() =>
    bhApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
  );

  loadCritters();
  const [currentCritterId, setCurrentCritterId] = useState<string | null>(null);

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
      <IndividualAnimalForm />
    </Formik>
  );
};
