import Stack from '@mui/material/Stack';
import AnimalProfile from './AnimalProfile';

const AnimalProfileContainer = () => {
  // const { setSelectedAnimal } = useAnimalPageContext();

  return (
    <Stack spacing={1.5} flexDirection="column" height="100%" maxWidth="100%">
      <AnimalProfile />
    </Stack>
  );
};

export default AnimalProfileContainer;
