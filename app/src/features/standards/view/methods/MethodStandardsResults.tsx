import Stack from '@mui/material/Stack';
import { IMethodStandard } from 'interfaces/useStandardsApi.interface';
import MethodStandardCard from './components/MethodStandardsCard';

interface ISpeciesStandardsResultsProps {
  data: IMethodStandard[];
  isLoading?: boolean;
}

/**
 * Component to display methods standards results
 *
 * @return {*}
 */
export const MethodStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data } = props;

  return (
    <>
      <Stack gap={2}>
        {data.map((method) => (
          <MethodStandardCard
            key={method.method_lookup_id}
            name={method.name}
            description={method.description}
            quantitativeAttributes={method.attributes.quantitative}
            qualitativeAttributes={method.attributes.qualitative}
          />
        ))}
      </Stack>
    </>
  );
};

export default MethodStandardsResults;
