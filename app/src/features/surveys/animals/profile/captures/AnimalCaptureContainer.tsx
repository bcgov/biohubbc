import { mdiAlertRhombusOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { orange } from '@mui/material/colors';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { AnimalCaptureCardContainer } from 'features/surveys/animals/profile/captures/components/AnimalCaptureCardContainer';
import { AnimalCapturesToolbar } from 'features/surveys/animals/profile/captures/components/AnimalCapturesToolbar';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import {
  ICaptureResponse,
  IMarkingResponse,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from 'interfaces/useCritterApi.interface';
import { useHistory } from 'react-router';
import { AnimalCapturesMap } from './components/AnimalCapturesMap';

export interface ICaptureWithSupplementaryData extends ICaptureResponse {
  markings: IMarkingResponse[];
  measurements: { qualitative: IQualitativeMeasurementResponse[]; quantitative: IQuantitativeMeasurementResponse[] };
}

/**
 * Container for the animal captures component within the animal profile page
 *
 * @return {*}
 */
export const AnimalCaptureContainer = () => {
  const critterbaseApi = useCritterbaseApi();
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();

  const history = useHistory();

  const { projectId, surveyId } = useSurveyContext();

  const animalPageContext = useAnimalPageContext();

  const data = animalPageContext.critterDataLoader.data;

  if (!animalPageContext.selectedAnimal || animalPageContext.critterDataLoader.isLoading) {
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

  const selectedAnimal = animalPageContext.selectedAnimal;

  if (!selectedAnimal) {
    return null;
  }

  const captures: ICaptureWithSupplementaryData[] =
    data?.captures.map((capture) => ({
      ...capture,
      markings: data?.markings.filter((marking) => marking.capture_id === capture.capture_id),
      measurements: {
        qualitative: data.measurements.qualitative.filter(
          (measurement) => measurement.capture_id === capture.capture_id
        ),
        quantitative: data.measurements.quantitative.filter(
          (measurement) => measurement.capture_id === capture.capture_id
        )
      }
    })) || [];

  const handleDelete = async (selectedCapture: string, critter_id: number) => {
    try {
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

      // Delete all capture attachments
      await biohubApi.animal.deleteCaptureAttachments({
        projectId,
        surveyId,
        critterId: selectedAnimal.critter_id,
        critterbaseCaptureId: selectedCapture
      });

      // Refresh capture container
      animalPageContext.critterDataLoader.refresh(projectId, surveyId, critter_id);

      // Show success snackbar
      dialogContext.setSnackbar({
        open: true,
        onClose: () => dialogContext.setSnackbar({ open: false }),
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Successfully deleted Capture
          </Typography>
        )
      });
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: 'Error deleting Capture',
        dialogText: 'An error occurred while deleting the Capture.',
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const capturesWithLocation = captures.filter((capture) => capture.capture_location);

  return (
    <>
      <AnimalCapturesToolbar
        capturesCount={captures.length}
        onAddAnimalCapture={() => {
          history.push(
            `/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.critter_id}/capture/create`
          );
        }}
      />
      {capturesWithLocation.length < captures.length && (
        <Stack gap={1} direction="row" alignItems="center" display="flex" px={3} py={2} bgcolor={orange[50]}>
          <Icon path={mdiAlertRhombusOutline} size={1} color={orange[800]} />
          <Typography color={orange[800]} variant="body2">
            Not all captures are visible on the map due to missing location data. Please update these captures with
            location information.
          </Typography>
        </Stack>
      )}
      {captures.length > 0 && <AnimalCapturesMap captures={capturesWithLocation} isLoading={false} />}
      <AnimalCaptureCardContainer captures={captures} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};
