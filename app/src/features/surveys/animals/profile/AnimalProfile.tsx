import { CircularProgress, Typography } from '@mui/material';
import { useAnimalPageContext } from 'hooks/useContext';

const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();

  const critterDataLoader = animalPageContext.critterDataLoader;

  const critter = critterDataLoader.data;

  if (!critter || critterDataLoader.isLoading) {
    return <CircularProgress size={40} />;
  }

  return (
    <>
      <Typography variant="h2">{critter.animal_id}</Typography>
      <Typography variant="h2">{critter.itis_tsn}</Typography>
      <Typography>{critter.captures.map((capture) => capture.capture_id)}</Typography>
    </>
  );
};

export default AnimalProfile;
