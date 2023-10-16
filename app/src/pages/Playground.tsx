import { Button, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import SurveyObservationHeader from 'features/surveys/observations/SurveyObservationHeader';
import { AnimalSchema, AnimalSex, IAnimal } from 'features/surveys/view/survey-animals/animal';
import IndividualAnimalForm from 'features/surveys/view/survey-animals/IndividualAnimalForm';
import { Formik } from 'formik';

export const Playground = () => {
  const surveyContext = {
    projectId: 1,
    surveyId: 1
  };

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

  return (
    <Box display="flex" flexDirection="column" height="90vh" overflow="hidden" position="relative">
      <Box
        zIndex={999}
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}>
        <SurveyObservationHeader
          project_id={surveyContext.projectId}
          survey_id={surveyContext.surveyId}
          survey_name={'Test'}
        />
      </Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden" p={1}>
        {/* Sampling Site List */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 auto',
            flexDirection: 'column',
            width: 400,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '1px solid' + grey[300]
          }}>
          <Button
            onClick={() => {
              document.getElementById('general-animal-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
            General
          </Button>
          <Button
            onClick={() => {
              document.getElementById('marking-animal-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
            Marking
          </Button>
          <Button
            onClick={() => {
              document.getElementById('family-animal-form')?.scrollIntoView({ behavior: 'smooth' });
            }}>
            Family
          </Button>
        </Paper>

        {/* Observations Component */}
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
            initialValues={AnimalFormValues}
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
