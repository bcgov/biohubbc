import Grid from '@mui/material/Grid';
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
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <CaptureDetails capture={capture} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ReleaseDetails capture={capture} />
        </Grid>
      </Grid>
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
