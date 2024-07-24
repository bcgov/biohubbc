import Stack from '@mui/material/Stack';
import MeasurementStandardCard from '../components/MeasurementStandardCard';
import { IMethodStandardResult } from './MethodStandards';

interface ISpeciesStandardsResultsProps {
  data: IMethodStandardResult[]; // Change to IGetMethodStandardsResults or similar when it exists
  isLoading?: boolean;
}

/**
 * Component to display methods standards results
 *
 * @return {*}
 */
export const MethodStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data} = props;

  return (
    <>
      <Stack gap={2}>
        {/* Quantitative attributes */}
        {data.map((method) => (
          <MeasurementStandardCard label={method.label} description={method.description ?? ''} />
        ))}
      </Stack>
    </>
  );
};
