import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { SurveyContext } from 'contexts/surveyContext';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useMemo, useState } from 'react';
import { AnimalSchema, AnimalSex, IAnimal } from './animal';
import AnimalList from './AnimalList';
import IndividualAnimalForm, { ANIMAL_FORM_MODE } from './IndividualAnimalForm';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { transformCritterbaseAPIResponseToForm } from './animal-form-helpers';

export const SurveyAnimalPage = () => {
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
    <Box display="flex" flexDirection="column" height="90vh" overflow="hidden" position="relative">
      <Box
        zIndex={999}
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}></Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden" p={1}>
        {/* Animals List */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 auto',
            width: 400,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '1px solid' + grey[300]
          }}>
          <AnimalList onSelectCritter={setCurrentCritterId} />
        </Paper>

        {/* Marked and Known animals Component */}
        <Paper
          elevation={0}
          sx={{
            flex: '1 1 auto',
            overflowY: 'auto',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            padding: 2
          }}>
          <Formik
            initialValues={obtainAnimalFormInitialvalues}
            enableReinitialize
            validationSchema={AnimalSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values) => {}}>
            <IndividualAnimalForm />
          </Formik>
        </Paper>
      </Box>
    </Box>
  );
};
