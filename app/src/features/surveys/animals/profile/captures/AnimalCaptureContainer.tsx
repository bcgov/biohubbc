import { ISurveyCritter } from 'contexts/animalPageContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

interface IAnimalCaptureContainerProps {
  isLoading: boolean;
  captures: ICaptureResponse[];
  createCaptureRoute: string;
  selectedAnimal: ISurveyCritter;
  handleRefresh: (critterbase_critter_id: string) => void;
}

/**
 * Container for the animal captures map component within the animal profile page
 *
 * @returns
 */
const AnimalCaptureContainer = (props: IAnimalCaptureContainerProps) => {
  const { isLoading, captures, createCaptureRoute, selectedAnimal, handleRefresh } = props;
  const critterbaseApi = useCritterbaseApi();

  const handleDelete = async (selectedCapture: string, critterbase_critter_id: string) => {
    await critterbaseApi.capture.deleteCapture(selectedCapture);
    handleRefresh(critterbase_critter_id);
  };

  return (
    <>
      <AnimalCapturesToolbar capturesCount={captures.length} createCaptureRoute={createCaptureRoute} />
      <AnimalCapturesMap captures={captures} isLoading={isLoading} />
      <AnimalCaptureCardContainer captures={captures} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};

export default AnimalCaptureContainer;
