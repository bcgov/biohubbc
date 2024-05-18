import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useHistory } from 'react-router';
import AnimalMortalityMap from './components/AnimalMortalityMap';
import AnimalMortalityToolbar from './components/AnimalMortalityToolbar';

const AnimalMortalityContainer = () => {
  const { selectedAnimal, critterDataLoader } = useAnimalPageContext();
  const history = useHistory();

  const { surveyId, projectId } = useSurveyContext();

  // SHOULD ONLY BE ONE MORTALITY
  const mortality = critterDataLoader.data?.mortality;

  if (!selectedAnimal || critterDataLoader.isLoading) {
    return (
      <Box flex="1 1 auto" p={2}>
        <Box display="flex" justifyContent="space-between">
          <Skeleton height="25px" width="50px" />
          <Skeleton height="25px" width="150px" />
        </Box>
        <Skeleton height="150px" width="100%"></Skeleton>
      </Box>
    );
  }

  return (
    <>
      <AnimalMortalityToolbar
        onAddAnimalMortality={() => {
          history.push(
            `/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.survey_critter_id}/mortality/create`
          );
        }}
      />
      {mortality && mortality.length > 0 && <AnimalMortalityMap mortality={mortality} isLoading={false} />}
      {/* <AnimalmortalityCardContainer mortalitys={mortalitys} selectedAnimal={selectedAnimal} handleDelete={handleDelete} /> */}
    </>
  );
};

export default AnimalMortalityContainer;
