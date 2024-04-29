import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

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
