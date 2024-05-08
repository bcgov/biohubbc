import Paper from '@mui/material/Paper';
import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

/**
 * Container for the animal captures map component within the animal profile page
 *
 * @returns
 */
const AnimalCaptureContainer = () => {
  return (
    <Paper>
      <AnimalCapturesToolbar />
      <AnimalCapturesMap />
      <AnimalCaptureCardContainer />
    </Paper>
  );
};

export default AnimalCaptureContainer;
