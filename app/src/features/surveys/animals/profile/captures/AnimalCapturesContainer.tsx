import Paper from '@mui/material/Paper';
import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

const AnimalCapturesContainer = () => {
  return (
    <Paper variant="outlined">
      <AnimalCapturesToolbar />
      <AnimalCapturesMap />
      <AnimalCaptureCardContainer />
    </Paper>
  );
};

export default AnimalCapturesContainer;
