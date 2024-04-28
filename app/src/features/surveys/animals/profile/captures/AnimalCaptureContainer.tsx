import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

const AnimalCaptureContainer = () => {
  return (
    <>
      <AnimalCapturesToolbar />
      <AnimalCapturesMap />
      {/* <Paper variant="outlined" sx={{ p: 2 }}> */}
      <AnimalCaptureCardContainer />
      {/* </Paper> */}
    </>
  );
};

export default AnimalCaptureContainer;
