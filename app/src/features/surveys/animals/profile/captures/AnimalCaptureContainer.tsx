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
    <>
      <AnimalCapturesToolbar />
      <AnimalCapturesMap />
      <AnimalCaptureCardContainer />
    </>
  );
};

export default AnimalCaptureContainer;
