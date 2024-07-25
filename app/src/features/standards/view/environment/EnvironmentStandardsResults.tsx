import Stack from '@mui/material/Stack';
import { IEnvironmentStandards } from 'interfaces/useStandardsApi.interface';
import MeasurementStandardCard from '../components/MeasurementStandardCard';

interface ISpeciesStandardsResultsProps {
  data: IEnvironmentStandards;
  isLoading?: boolean;
}

/**
 * Component to display environments standards results
 *
 * @return {*}
 */
export const EnvironmentStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data } = props;

  return (
    <>
      <Stack gap={2}>
        {data.quantitative.map((environment) => (
          <MeasurementStandardCard label={environment.name} description={environment.description ?? ''} />
        ))}
        {data.qualitative.map((environment) => (
          <MeasurementStandardCard label={environment.name} description={environment.description ?? ''} />
        ))}
      </Stack>
    </>
  );
};
