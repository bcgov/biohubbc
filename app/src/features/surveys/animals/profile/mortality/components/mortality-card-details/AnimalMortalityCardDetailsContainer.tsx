import Stack from '@mui/material/Stack';
import { MarkingDetails } from 'features/surveys/animals/profile/components/MarkingDetails';
import { MeasurementDetails } from 'features/surveys/animals/profile/components/MeasurementDetails';
import { IMortalityWithSupplementaryData } from 'features/surveys/animals/profile/mortality/AnimalMortalityContainer';
import { MortalityDetails } from 'features/surveys/animals/profile/mortality/components/mortality-card-details/MortalityDetails';

interface IAnimalMortalityCardDetailsContainerProps {
  mortality: IMortalityWithSupplementaryData;
}

/**
 * Details displayed with the accordion component displaying an animal mortality
 *
 * @param {IAnimalMortalityCardDetailsContainerProps} props
 * @return {*}
 */
export const AnimalMortalityCardDetailsContainer = (props: IAnimalMortalityCardDetailsContainerProps) => {
  const { mortality } = props;

  return (
    <Stack gap={3} sx={{ '& .MuiTypography-body2': { fontSize: '0.9rem' } }}>
      <MortalityDetails mortality={mortality} />
      <MarkingDetails markings={mortality.markings} />
      <MeasurementDetails measurements={mortality.measurements} />
    </Stack>
  );
};
