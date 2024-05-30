import Stack from '@mui/material/Stack';
import { CaptureDetails } from 'features/surveys/animals/profile/captures/components/capture-card-details/components/CaptureDetails';
import { ReleaseDetails } from 'features/surveys/animals/profile/captures/components/capture-card-details/components/ReleaseDetails';
import { MarkingDetails } from 'features/surveys/animals/profile/components/MarkingDetails';
import { MeasurementDetails } from 'features/surveys/animals/profile/components/MeasurementDetails';
import { ICaptureWithSupplementaryData } from '../../AnimalCaptureContainer';

interface IAnimalCaptureCardDetailsContainerProps {
  capture: ICaptureWithSupplementaryData;
}

/**
 * Details displayed with the accordion component displaying an animal capture
 *
 * @param {IAnimalCaptureCardDetailsContainerProps} props
 * @return {*}
 */
export const AnimalCaptureCardDetailsContainer = (props: IAnimalCaptureCardDetailsContainerProps) => {
  const { capture } = props;

  return (
    <Stack gap={3} sx={{ '& .MuiTypography-body2': { fontSize: '0.9rem' } }}>
      <CaptureDetails capture={capture} />
      <ReleaseDetails capture={capture} />
      <MarkingDetails markings={capture.markings} />
      <MeasurementDetails
        measurements={{
          qualitative: capture.measurements.qualitative,
          quantitative: capture.measurements.quantitative
        }}
      />
    </Stack>
  );
};
