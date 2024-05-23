import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import {
  ICaptureResponse,
  IMarkingResponse,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from 'interfaces/useCritterApi.interface';
import { useHistory } from 'react-router';
import { AnimalCaptureCardContainer } from './components/AnimalCaptureCardContainer';
import { AnimalCapturesMap } from './components/AnimalCapturesMap';
import { AnimalCapturesToolbar } from './components/AnimalCapturesToolbar';

export interface ICapturesWithSupplementaryData extends ICaptureResponse {
  markings: IMarkingResponse[];
  measurements: { qualitative: IQualitativeMeasurementResponse[]; quantitative: IQuantitativeMeasurementResponse[] };
}
/**
 * Container for the animal captures map component within the animal profile page
 *
 * @return {*}
 */
export const AnimalCaptureContainer = () => {
  const critterbaseApi = useCritterbaseApi();

  const history = useHistory();

  const { projectId, surveyId } = useSurveyContext();

  const animalPageContext = useAnimalPageContext();

  const data = animalPageContext.critterDataLoader.data;

  if (!animalPageContext.selectedAnimal || !data) {
    return (
      <Box p={2}>
        <SkeletonHorizontalStack numberOfLines={2} />
        <Skeleton width="100%" height="200px" />
        <Skeleton width="100%" height="50px" />
        <Skeleton width="100%" height="50px" />
        <Skeleton width="100%" height="50px" />
      </Box>
    );
  }

  const captures: ICapturesWithSupplementaryData[] = data.captures.map((capture) => ({
    ...capture,
    markings: data?.markings.filter((marking) => marking.capture_id === capture.capture_id),
    measurements: {
      qualitative: data.measurements.qualitative.filter((measurement) => measurement.capture_id === capture.capture_id),
      quantitative: data.measurements.quantitative.filter(
        (measurement) => measurement.capture_id === capture.capture_id
      )
    }
  }));
  const selectedAnimal = animalPageContext.selectedAnimal;

  const handleDelete = async (selectedCapture: string, critterbase_critter_id: string) => {
    // Delete markings and measurements associated with the capture to avoid foreign key constraint error
    await critterbaseApi.critters.bulkUpdate({
      markings: data?.markings
        .filter((marking) => marking.capture_id === selectedCapture)
        .map((marking) => ({
          ...marking,
          critter_id: selectedAnimal.critterbase_critter_id,
          _delete: true
        })),
      qualitative_measurements:
        data?.measurements.qualitative
          .filter((measurement) => measurement.capture_id === selectedCapture)
          .map((measurement) => ({
            ...measurement,
            _delete: true
          })) ?? [],
      quantitative_measurements:
        data?.measurements.quantitative
          .filter((measurement) => measurement.capture_id === selectedCapture)
          .map((measurement) => ({
            ...measurement,
            _delete: true
          })) ?? []
    });

    // Delete the actual capture
    await critterbaseApi.capture.deleteCapture(selectedCapture);

    // Refresh capture container
    animalPageContext.critterDataLoader.refresh(critterbase_critter_id);
  };

  if (!selectedAnimal) {
    return null;
  }

  return (
    <>
      <AnimalCapturesToolbar
        capturesCount={captures.length}
        onAddAnimalCapture={() => {
          history.push(
            `/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.survey_critter_id}/capture/create`
          );
        }}
      />
      <AnimalCapturesMap captures={captures} isLoading={false} />
      <AnimalCaptureCardContainer captures={captures} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};
