import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AnimalProfile from './AnimalProfile';

const AnimalProfileContainer = () => {
  // const { setSelectedAnimal } = useAnimalPageContext();

  return (
    <Box component={Stack} spacing={1.5} flexDirection="column" flex="1 1 auto" height='100%'>
      <AnimalProfile />
    </Box>
  );
};

export default AnimalProfileContainer;
